import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '@/store/context';
import { questions } from '@/data/questions';
import { Question } from '@/types';
import styles from './index.module.scss';

interface FollowUp {
  question: string;
  answer: string;
}

const DetailPage: React.FC = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [newFollowUp, setNewFollowUp] = useState('');
  const { addFavorite, removeFavorite, isFavorite, markAsRead, addTodo, toggleTodo, todos, getTodo } = useAppContext();

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as any).options || {};
    const id = options.id;

    if (id) {
      const found = questions.find(q => q.id === id);
      if (found) {
        setQuestion(found);
        markAsRead(id);
      }
    }
  }, []);

  const handleFavoriteToggle = () => {
    if (!question) return;
    if (isFavorite(question.id)) {
      removeFavorite(question.id);
    } else {
      addFavorite(question.id);
    }
  };

  const handleFollowUp = () => {
    if (!newFollowUp.trim() || !question) return;
    
    const followUp: FollowUp = {
      question: newFollowUp.trim(),
      answer: '感谢您的追问！建议您咨询专业兽医以获取更准确的建议。'
    };
    
    setFollowUps([...followUps, followUp]);
    setNewFollowUp('');
  };

  const handleFollowUpInput = (e) => {
    setNewFollowUp(e.detail.value);
  };

  const handleRelatedClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  };

  const handleAddTodo = () => {
    if (!question) return;
    const todoContent = `学习：${question.title}`;
    addTodo(todoContent, question.id, question.category);
    Taro.showToast({
      title: '已添加到待办',
      icon: 'success',
      duration: 1500
    });
  };

  const handleToggleTodoFromDetail = () => {
    if (!question) return;
    const relatedTodo = todos.find(t => t.relatedQuestionId === question.id);
    if (relatedTodo) {
      toggleTodo(relatedTodo.id);
    }
  };

  const favoriteActive = isFavorite(question?.id || '');
  const relatedTodo = question ? todos.find(t => t.relatedQuestionId === question.id) : null;
  const isTodoCompleted = relatedTodo?.completed || false;

  if (!question) {
    return (
      <View className={styles.container}>
        <View className={styles.section}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  const getPetIcon = () => {
    if (question.applicablePet === 'cat') return '🐱';
    if (question.applicablePet === 'dog') return '🐶';
    return '🐱🐶';
  };

  const getPetName = () => {
    if (question.applicablePet === 'cat') return '猫咪';
    if (question.applicablePet === 'dog') return '狗狗';
    return '猫狗通用';
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>{question.title}</Text>
        <View className={styles.meta}>
          <Text className={styles.tag}>{getPetIcon()} {getPetName()}</Text>
          <Text className={styles.tag}>📅 {question.ageRange}</Text>
          {question.tags.map(tag => (
            <Text key={tag} className={styles.tag}>{tag}</Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>
          <Text>答案详情</Text>
        </View>
        <Text className={styles.content}>{question.content}</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⚠️</Text>
          <Text>注意事项</Text>
        </View>
        <View className={styles.warningSection} style={{ background: 'transparent', border: 'none' }}>
          <View className={styles.warningList}>
            {question.precautions.map((item, index) => (
              <View key={index} className={styles.warningItem} style={{ color: '#F39C12' }}>
                {item}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>❌</Text>
          <Text>常见误区</Text>
        </View>
        <View className={styles.misconceptionSection} style={{ background: 'transparent', border: 'none' }}>
          <View className={styles.misconceptionList}>
            {question.misconceptions.map((item, index) => (
              <View key={index} className={styles.misconceptionItem}>
                {item}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🚨</Text>
          <Text>何时应就医</Text>
        </View>
        <View className={styles.doctorSection}>
          <View className={styles.doctorList}>
            {question.seekDoctorSigns.map((item, index) => (
              <View key={index} className={styles.doctorItem}>
                {item}
              </View>
            ))}
          </View>
        </View>
      </View>

      {relatedTodo && (
        <View className={styles.todoStatusCard}>
          <View className={styles.todoStatusHeader}>
            <Text className={styles.todoStatusIcon}>📋</Text>
            <Text className={styles.todoStatusTitle}>关联学习计划</Text>
          </View>
          <Text className={styles.todoStatusContent}>{relatedTodo.content}</Text>
          <View className={styles.todoStatusFooter}>
            <Text className={`${styles.todoStatusBadge} ${isTodoCompleted ? styles.completed : ''}`}>
              {isTodoCompleted ? '✅ 已完成' : '⏳ 待完成'}
            </Text>
            <View 
              className={`${styles.todoToggleButton} ${isTodoCompleted ? styles.completedButton : ''}`}
              onClick={handleToggleTodoFromDetail}
            >
              <Text style={{ color: isTodoCompleted ? '#27AE60' : '#fff', fontSize: '26rpx' }}>
                {isTodoCompleted ? '标记未完成' : '标记完成'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {followUps.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>💬</Text>
            <Text>追问记录</Text>
          </View>
          <View className={styles.followUpList}>
            {followUps.map((followUp, index) => (
              <View key={index} className={styles.followUpItem}>
                <Text className={styles.followUpQuestion}>问：{followUp.question}</Text>
                <Text className={styles.followUpAnswer}>答：{followUp.answer}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>💬</Text>
          <Text>继续追问</Text>
        </View>
        <View className={styles.followUpInput}>
          <Input
            className={styles.followUpField}
            placeholder="输入你的追问..."
            value={newFollowUp}
            onInput={handleFollowUpInput}
            onConfirm={handleFollowUp}
          />
          <View className={styles.followUpButton} onClick={handleFollowUp}>
            <Text style={{ color: '#fff', fontSize: '28rpx' }}>追问</Text>
          </View>
        </View>
      </View>

      {question.relatedQuestions.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📖</Text>
            <Text>相关问题</Text>
          </View>
          {question.relatedQuestions.map(id => {
            const related = questions.find(q => q.id === id);
            if (!related) return null;
            return (
              <View 
                key={id} 
                className={styles.relatedCard}
                onClick={() => handleRelatedClick(id)}
              >
                <Text className={styles.relatedTitle}>{related.title}</Text>
                <Text className={styles.relatedIcon}>›</Text>
              </View>
            );
          })}
        </View>
      )}

      <View className={styles.bottomSpacer}></View>

      <View className={styles.bottomBar}>
        <View 
          className={`${styles.actionButton} ${favoriteActive ? styles.favoriteActive : styles.favorite}`}
          onClick={handleFavoriteToggle}
        >
          <Text>{favoriteActive ? '❤️ 已收藏' : '🤍 收藏'}</Text>
        </View>
        <View 
          className={`${styles.actionButton} ${relatedTodo ? (isTodoCompleted ? styles.todoCompleted : styles.todoActive) : styles.todo}`}
          onClick={relatedTodo ? handleToggleTodoFromDetail : handleAddTodo}
        >
          <Text>
            {relatedTodo 
              ? (isTodoCompleted ? '✅ 已完成' : '📋 待完成') 
              : '📝 待办'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default DetailPage;
