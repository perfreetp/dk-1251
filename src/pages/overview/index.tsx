import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '@/store/context';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';
import styles from './index.module.scss';

const OverviewPage: React.FC = () => {
  const { favorites, readRecords, todos } = useAppContext();

  const readCount = readRecords.filter(r => r.read).length;
  const totalQuestions = questions.length;
  const readPercent = totalQuestions > 0 ? Math.round((readCount / totalQuestions) * 100) : 0;
  
  const completedTodos = todos.filter(t => t.completed).length;
  const pendingTodos = todos.filter(t => !t.completed).length;

  const readByCategory = categories.map(cat => {
    const catQuestions = questions.filter(q => q.category === cat.id);
    const catReadCount = catQuestions.filter(q => 
      readRecords.some(r => r.questionId === q.id && r.read)
    ).length;
    return {
      ...cat,
      total: catQuestions.length,
      read: catReadCount,
      percent: catQuestions.length > 0 ? Math.round((catReadCount / catQuestions.length) * 100) : 0
    };
  });

  const unreadCategories = readByCategory.filter(c => c.read < c.total);
  const hasUnread = unreadCategories.length > 0;

  const handleCategoryClick = (categoryId: string) => {
    Taro.navigateTo({
      url: `/pages/category/index?category=${categoryId}`
    });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>📊 学习概览</Text>
        <Text className={styles.subtitle}>了解你的学习进度</Text>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>📚</Text>
          <Text className={styles.statValue}>{readCount}</Text>
          <Text className={styles.statLabel}>已阅读</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>❤️</Text>
          <Text className={styles.statValue}>{favorites.length}</Text>
          <Text className={styles.statLabel}>收藏</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>✅</Text>
          <Text className={styles.statValue}>{completedTodos}</Text>
          <Text className={styles.statLabel}>已完成待办</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>📝</Text>
          <Text className={styles.statValue}>{pendingTodos}</Text>
          <Text className={styles.statLabel}>待完成</Text>
        </View>
      </View>

      <View className={styles.progressCard}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressTitle}>总体阅读进度</Text>
          <Text className={styles.progressBadge}>
            {readPercent === 100 ? '🎉 已完成' : '进行中'}
          </Text>
        </View>
        <View className={styles.progressBar}>
          <View 
            className={styles.progressFill} 
            style={{ width: `${readPercent}%` }}
          ></View>
        </View>
        <View className={styles.progressInfo}>
          <Text className={styles.progressText}>
            已阅读 {readCount} / {totalQuestions} 篇
          </Text>
          <Text className={styles.progressPercent}>{readPercent}%</Text>
        </View>

        <View className={styles.categoryList}>
          {readByCategory.map(cat => (
            <View 
              key={cat.id} 
              className={styles.categoryItem}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <Text className={styles.categoryIcon}>{cat.icon}</Text>
              <View className={styles.categoryInfo}>
                <Text className={styles.categoryName}>{cat.name}</Text>
                <View className={styles.categoryProgressBar}>
                  <View 
                    className={styles.categoryProgressFill}
                    style={{ width: `${cat.percent}%` }}
                  ></View>
                </View>
              </View>
              <Text className={styles.categoryCount}>
                {cat.read}/{cat.total}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {hasUnread && (
        <View className={styles.remainingSection}>
          <Text className={styles.sectionTitle}>📖 待学习分类</Text>
          {unreadCategories.map(cat => (
            <View 
              key={cat.id} 
              className={styles.remainingItem}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <Text className={styles.remainingText}>
                {cat.icon} {cat.name}
              </Text>
              <Text className={styles.remainingCount}>
                还差 {cat.total - cat.read} 篇
              </Text>
            </View>
          ))}
        </View>
      )}

      <View className={styles.todoProgressSection}>
        <Text className={styles.sectionTitle}>📝 待办事项进度</Text>
        <View className={styles.todoStats}>
          <View className={styles.todoStat}>
            <Text className={`${styles.todoStatValue} ${styles.completed}`}>
              {completedTodos}
            </Text>
            <Text className={styles.todoStatLabel}>已完成</Text>
          </View>
          <View className={styles.todoStat}>
            <Text className={`${styles.todoStatValue} ${styles.pending}`}>
              {pendingTodos}
            </Text>
            <Text className={styles.todoStatLabel}>待完成</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default OverviewPage;
