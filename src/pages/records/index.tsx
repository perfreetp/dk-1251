import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '@/store/context';
import { questions } from '@/data/questions';
import { categories } from '@/data/categories';
import { Question } from '@/types';
import styles from './index.module.scss';

type TabType = 'overview' | 'read' | 'todo';

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [newTodo, setNewTodo] = useState('');
  const [sortOrder, setSortOrder] = useState<'time' | 'category'>('time');
  const [showRelatedQuestions, setShowRelatedQuestions] = useState(false);
  const { 
    readRecords, 
    todos, 
    addTodo, 
    toggleTodo, 
    deleteTodo,
    toggleRead,
    getReadTime,
    isRead
  } = useAppContext();

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
      setShowRelatedQuestions(false);
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

  const handleOverviewClick = () => {
    Taro.navigateTo({
      url: '/pages/overview/index'
    });
  };

  const handleQuestionClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  };

  const handleToggleRead = (id: string) => {
    toggleRead(id);
  };

  const readCount = readRecords.filter(r => r.read).length;
  const completedTodos = todos.filter(t => t.completed).length;

  const readQuestionList = questions.filter(q => isRead(q.id));

  const sortedReadQuestions = [...readQuestionList].sort((a, b) => {
    if (sortOrder === 'time') {
      const timeA = getReadTime(a.id) || '';
      const timeB = getReadTime(b.id) || '';
      return timeB.localeCompare(timeA);
    } else {
      return a.category.localeCompare(b.category);
    }
  });

  const incompleteTodos = todos.filter(t => !t.completed);
  const completedTodoList = todos.filter(t => t.completed);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>📋 个人记录</Text>
        <Text className={styles.subtitle}>
          已读 {readCount} 篇 | 待办 {todos.length} 项
        </Text>
      </View>

      <View 
        className={styles.overviewBanner} 
        onClick={handleOverviewClick}
      >
        <View className={styles.overviewContent}>
          <Text className={styles.overviewIcon}>�</Text>
          <View className={styles.overviewText}>
            <Text className={styles.overviewTitle}>学习概览</Text>
            <Text className={styles.overviewDesc}>查看分类阅读进度和统计</Text>
          </View>
        </View>
        <Text className={styles.overviewArrow}>›</Text>
      </View>

      <View className={styles.tabs}>
        <View 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          概览
        </View>
        <View 
          className={`${styles.tab} ${activeTab === 'read' ? styles.active : ''}`}
          onClick={() => setActiveTab('read')}
        >
          已读
        </View>
        <View 
          className={`${styles.tab} ${activeTab === 'todo' ? styles.active : ''}`}
          onClick={() => setActiveTab('todo')}
        >
          待办
        </View>
      </View>

      {activeTab === 'overview' && (
        <View className={styles.section}>
          <View className={styles.overviewStats}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{readCount}</Text>
              <Text className={styles.statLabel}>已读</Text>
            </View>
            <View className={styles.statDivider}></View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{completedTodos}</Text>
              <Text className={styles.statLabel}>已完成</Text>
            </View>
            <View className={styles.statDivider}></View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{todos.length - completedTodos}</Text>
              <Text className={styles.statLabel}>待完成</Text>
            </View>
          </View>

          <View className={styles.knowledgeBanner} onClick={handleViewKnowledgeList}>
            <Text className={styles.knowledgeIcon}>📚</Text>
            <View className={styles.knowledgeText}>
              <Text className={styles.knowledgeTitle}>养宠知识清单</Text>
              <Text className={styles.knowledgeDesc}>按年龄段整理的知识汇总</Text>
            </View>
            <Text className={styles.knowledgeArrow}>›</Text>
          </View>
        </View>
      )}

      {activeTab === 'read' && (
        <View className={styles.section}>
          <View className={styles.readHeader}>
            <Text className={styles.readTitle}>阅读列表</Text>
            <View className={styles.sortButtons}>
              <Text 
                className={`${styles.sortButton} ${sortOrder === 'time' ? styles.active : ''}`}
                onClick={() => setSortOrder('time')}
              >
                按时间
              </Text>
              <Text 
                className={`${styles.sortButton} ${sortOrder === 'category' ? styles.active : ''}`}
                onClick={() => setSortOrder('category')}
              >
                按分类
              </Text>
            </View>
          </View>

          {sortedReadQuestions.length > 0 ? (
            <View className={styles.readList}>
              {sortedReadQuestions.map(q => {
                const cat = categories.find(c => c.id === q.category);
                const readTime = getReadTime(q.id);
                return (
                  <View key={q.id} className={styles.readItem}>
                    <View 
                      className={`${styles.readCheckbox} ${styles.checked}`}
                      onClick={() => handleToggleRead(q.id)}
                    >
                      <Text style={{ color: '#fff', fontSize: '24rpx' }}>✓</Text>
                    </View>
                    <View 
                      className={styles.readContent}
                      onClick={() => handleQuestionClick(q.id)}
                    >
                      <Text className={styles.readQuestionTitle}>{q.title}</Text>
                      <View className={styles.readMeta}>
                        <Text className={styles.readCategory}>
                          {cat?.icon} {cat?.name}
                        </Text>
                        {readTime && (
                          <Text className={styles.readTime}>
                            {formatTime(readTime)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text className={styles.readArrow}>›</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📖</Text>
              <Text className={styles.emptyText}>还没有已读记录</Text>
            </View>
          )}

          <View className={styles.allQuestionsSection}>
            <Text className={styles.allQuestionsTitle}>添加更多已读</Text>
            {questions.filter(q => !isRead(q.id)).slice(0, 5).map(q => {
              const cat = categories.find(c => c.id === q.category);
              return (
                <View key={q.id} className={styles.readItem}>
                  <View 
                    className={styles.readCheckbox}
                    onClick={() => handleToggleRead(q.id)}
                  ></View>
                  <View 
                    className={styles.readContent}
                    onClick={() => handleQuestionClick(q.id)}
                  >
                    <Text className={styles.readQuestionTitle}>{q.title}</Text>
                    <View className={styles.readMeta}>
                      <Text className={styles.readCategory}>
                        {cat?.icon} {cat?.name}
                      </Text>
                    </View>
                  </View>
                  <Text className={styles.readArrow}>›</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {activeTab === 'todo' && (
        <View className={styles.section}>
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

          {incompleteTodos.length > 0 && (
            <View className={styles.todoGroup}>
              <Text className={styles.todoGroupTitle}>待完成 ({incompleteTodos.length})</Text>
              <View className={styles.todoList}>
                {incompleteTodos.map(todo => {
                  const relatedQuestion = todo.relatedQuestionId 
                    ? questions.find(q => q.id === todo.relatedQuestionId)
                    : null;
                  return (
                    <View key={todo.id} className={styles.todoItem}>
                      <View 
                        className={styles.todoCheckbox}
                        onClick={() => toggleTodo(todo.id)}
                      ></View>
                      <View className={styles.todoInfo}>
                        <Text className={styles.todoContent}>{todo.content}</Text>
                        {relatedQuestion && (
                          <Text 
                            className={styles.todoRelated}
                            onClick={() => handleQuestionClick(relatedQuestion.id)}
                          >
                            📖 {relatedQuestion.title}
                          </Text>
                        )}
                      </View>
                      <Text className={styles.todoDelete} onClick={() => deleteTodo(todo.id)}>×</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {completedTodoList.length > 0 && (
            <View className={styles.todoGroup}>
              <Text className={styles.todoGroupTitle}>已完成 ({completedTodoList.length})</Text>
              <View className={styles.todoList}>
                {completedTodoList.map(todo => {
                  const relatedQuestion = todo.relatedQuestionId 
                    ? questions.find(q => q.id === todo.relatedQuestionId)
                    : null;
                  return (
                    <View key={todo.id} className={styles.todoItem}>
                      <View 
                        className={`${styles.todoCheckbox} ${styles.checked}`}
                        onClick={() => toggleTodo(todo.id)}
                      >
                        <Text style={{ color: '#fff', fontSize: '24rpx' }}>✓</Text>
                      </View>
                      <View className={styles.todoInfo}>
                        <Text className={`${styles.todoContent} ${styles.completed}`}>
                          {todo.content}
                        </Text>
                        {relatedQuestion && (
                          <Text 
                            className={styles.todoRelated}
                            onClick={() => handleQuestionClick(relatedQuestion.id)}
                          >
                            📖 {relatedQuestion.title}
                          </Text>
                        )}
                        {todo.completedAt && (
                          <Text className={styles.todoCompletedTime}>
                            完成于 {formatTime(todo.completedAt)}
                          </Text>
                        )}
                      </View>
                      <Text className={styles.todoDelete} onClick={() => deleteTodo(todo.id)}>×</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {todos.length === 0 && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>暂无待办事项</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default RecordsPage;
