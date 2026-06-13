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

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      days.push({
        date: dateStr,
        label: dayNames[date.getDay()],
        shortLabel: i === 0 ? '今天' : `${date.getMonth() + 1}/${date.getDate()}`,
        readCount: 0,
        todoCount: 0,
        categories: {} as Record<string, number>
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  readRecords.forEach(record => {
    if (record.read && record.readAt) {
      const readDate = record.readAt.split('T')[0];
      const dayData = last7Days.find(d => d.date === readDate);
      if (dayData) {
        dayData.readCount++;
        const question = questions.find(q => q.id === record.questionId);
        if (question) {
          if (!dayData.categories[question.category]) {
            dayData.categories[question.category] = 0;
          }
          dayData.categories[question.category]++;
        }
      }
    }
  });

  todos.forEach(todo => {
    if (todo.completed && todo.completedAt) {
      const completeDate = todo.completedAt.split('T')[0];
      const dayData = last7Days.find(d => d.date === completeDate);
      if (dayData) {
        dayData.todoCount++;
      }
    }
  });

  const totalRead7Days = last7Days.reduce((sum, d) => sum + d.readCount, 0);
  const totalTodo7Days = last7Days.reduce((sum, d) => sum + d.todoCount, 0);
  const activeDays = last7Days.filter(d => d.readCount > 0).length;

  const categoryHeat = categories.map(cat => {
    const readInCat = last7Days.reduce((sum, d) => sum + (d.categories[cat.id] || 0), 0);
    return {
      ...cat,
      recentRead: readInCat
    };
  }).sort((a, b) => b.recentRead - a.recentRead);

  const hotCategories = categoryHeat.filter(c => c.recentRead > 0);
  const coldCategories = categoryHeat.filter(c => c.recentRead === 0);

  const backlogCategories = readByCategory
    .filter(c => c.read === 0)
    .sort((a, b) => a.total - b.total);

  const handleCategoryClick = (categoryId: string) => {
    Taro.navigateTo({
      url: `/pages/category/index?category=${categoryId}`
    });
  };

  const maxRead = Math.max(...last7Days.map(d => d.readCount), 1);

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
      </View>

      <View className={styles.weekStatsCard}>
        <View className={styles.weekStatsHeader}>
          <Text className={styles.weekStatsTitle}>📅 复习节奏（近7天）</Text>
          <Text className={styles.weekStatsSubtitle}>
            阅读 {totalRead7Days} 篇 | 完成待办 {totalTodo7Days} 项 | 学习 {activeDays} 天
          </Text>
        </View>

        <View className={styles.weekChart}>
          {last7Days.map((day, index) => (
            <View key={index} className={styles.weekDay}>
              <View className={styles.weekBar}>
                <View 
                  className={styles.weekBarFill} 
                  style={{ 
                    height: `${Math.max((day.readCount / maxRead) * 100, day.readCount > 0 ? 10 : 0)}%`,
                    backgroundColor: index === 6 ? '#FF9B6A' : '#FFD93D'
                  }}
                ></View>
              </View>
              <Text className={styles.weekLabel}>{day.shortLabel}</Text>
              <Text className={styles.weekCount}>{day.readCount > 0 ? `${day.readCount}篇` : '-'}</Text>
            </View>
          ))}
        </View>

        <View className={styles.weekDetail}>
          {last7Days.filter(d => d.readCount > 0).map((day, index) => (
            <View key={index} className={styles.dayDetail}>
              <Text className={styles.dayLabel}>{day.shortLabel} {day.label}</Text>
              <View className={styles.dayCategories}>
                {Object.entries(day.categories).slice(0, 3).map(([catId, count]) => {
                  const cat = categories.find(c => c.id === catId);
                  return cat ? (
                    <View key={catId} className={styles.dayCategoryBadge}>
                      <Text>{cat.icon}</Text>
                      <Text className={styles.dayCategoryCount}>{count}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            </View>
          ))}
          {last7Days.filter(d => d.readCount > 0).length === 0 && (
            <Text className={styles.noActivity}>本周还没有学习记录</Text>
          )}
        </View>
      </View>

      {hotCategories.length > 0 && (
        <View className={styles.categoryHeatSection}>
          <Text className={styles.sectionTitle}>🔥 本周活跃分类</Text>
          <View className={styles.heatList}>
            {hotCategories.map((cat, index) => (
              <View 
                key={cat.id}
                className={styles.heatItem}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <View className={styles.heatRank}>
                  <Text className={styles.heatRankText}>{index + 1}</Text>
                </View>
                <Text className={styles.heatIcon}>{cat.icon}</Text>
                <Text className={styles.heatName}>{cat.name}</Text>
                <Text className={styles.heatCount}>{cat.recentRead}篇</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {backlogCategories.length > 0 && (
        <View className={styles.backlogSection}>
          <View className={styles.backlogHeader}>
            <Text className={styles.backlogTitle}>⚠️ 积压提醒</Text>
            <Text className={styles.backlogSubtitle}>这些分类还未开始学习</Text>
          </View>
          {backlogCategories.slice(0, 3).map(cat => (
            <View 
              key={cat.id}
              className={styles.backlogItem}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <Text className={styles.backlogIcon}>{cat.icon}</Text>
              <View className={styles.backlogInfo}>
                <Text className={styles.backlogName}>{cat.name}</Text>
                <Text className={styles.backlogCount}>共 {cat.total} 篇待学习</Text>
              </View>
              <View className={styles.backlogArrow}>
                <Text>开始学习 ›</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {hasUnread && (
        <View className={styles.remainingSection}>
          <Text className={styles.sectionTitle}>📖 待学习分类</Text>
          {unreadCategories.map(cat => (
            <View 
              key={cat.id} 
              className={styles.remainingItem}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <Text className={styles.remainingIcon}>{cat.icon}</Text>
              <View className={styles.remainingInfo}>
                <Text className={styles.remainingName}>{cat.name}</Text>
                <Text className={styles.remainingDesc}>还差 {cat.total - cat.read} 篇</Text>
              </View>
              <Text className={styles.remainingArrow}>›</Text>
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
