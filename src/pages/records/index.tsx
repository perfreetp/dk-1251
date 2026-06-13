import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import QuestionCard from '@/components/QuestionCard';
import { useAppContext } from '@/store/context';
import { questions } from '@/data/questions';
import styles from './index.module.scss';

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'read' | 'todo'>('read');
  const [newTodo, setNewTodo] = useState('');
  const { readQuestions, todos, addTodo, toggleTodo, deleteTodo } = useAppContext();

  const readQuestionList = questions.filter(q => readQuestions.has(q.id));

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const handleTodoInput = (e) => {
    setNewTodo(e.detail.value);
  };

  const handleViewKnowledgeList = () => {
    Taro.navigateTo({
      url: '/pages/quiz/index?view=list'
    });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>📋 个人记录</Text>
        <Text className={styles.subtitle}>
          已读 {readQuestionList.length} 篇 | 待办 {todos.length} 项
        </Text>
      </View>

      <View className={styles.knowledgeBanner} onClick={handleViewKnowledgeList}>
        <View className={styles.knowledgeBannerContent}>
          <Text className={styles.knowledgeBannerIcon}>📚</Text>
          <View className={styles.knowledgeBannerText}>
            <Text className={styles.knowledgeBannerTitle}>养宠知识清单</Text>
            <Text className={styles.knowledgeBannerDesc}>按年龄段整理的知识汇总</Text>
          </View>
        </View>
        <Text className={styles.knowledgeBannerArrow}>›</Text>
      </View>

      <View className={styles.tabs}>
        <View 
          className={`${styles.tab} ${activeTab === 'read' ? styles.active : ''}`}
          onClick={() => setActiveTab('read')}
        >
          已读列表
        </View>
        <View 
          className={`${styles.tab} ${activeTab === 'todo' ? styles.active : ''}`}
          onClick={() => setActiveTab('todo')}
        >
          待办事项
        </View>
      </View>

      {activeTab === 'read' && (
        <View className={styles.section}>
          {readQuestionList.length > 0 ? (
            readQuestionList.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>还没有已读记录</Text>
            </View>
          )}
        </View>
      )}

      {activeTab === 'todo' && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>待办事项</Text>
          </View>
          
          <View className={styles.todoInput}>
            <Input
              className={styles.todoInputField}
              placeholder="添加新的待办事项..."
              value={newTodo}
              onInput={handleTodoInput}
              onConfirm={handleAddTodo}
            />
            <View className={styles.todoAddButton} onClick={handleAddTodo}>
              <Text style={{ color: '#fff', fontSize: '28rpx' }}>添加</Text>
            </View>
          </View>

          <View className={styles.todoList}>
            {todos.length > 0 ? (
              todos.map(todo => (
                <View key={todo.id} className={styles.todoItem}>
                  <View 
                    className={`${styles.todoCheckbox} ${todo.completed ? styles.checked : ''}`}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.completed && <Text style={{ color: '#fff', fontSize: '24rpx' }}>✓</Text>}
                  </View>
                  <Text className={`${styles.todoContent} ${todo.completed ? styles.completed : ''}`}>
                    {todo.content}
                  </Text>
                  <Text className={styles.todoDelete} onClick={() => deleteTodo(todo.id)}>×</Text>
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂无待办事项</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default RecordsPage;
