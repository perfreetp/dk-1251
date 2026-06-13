import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SearchBar from '@/components/SearchBar';
import QuestionCard from '@/components/QuestionCard';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [hotQuestions] = useState(questions.slice(0, 3));

  const handleSearch = (keyword: string) => {
    if (keyword.trim()) {
      Taro.navigateTo({
        url: `/pages/home/index?search=${encodeURIComponent(keyword)}`
      });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    Taro.navigateTo({
      url: `/pages/category/index?category=${categoryId}`
    });
  };

  const handleQuizClick = () => {
    Taro.navigateTo({
      url: '/pages/quiz/index'
    });
  };

  const handleRecordsClick = () => {
    Taro.switchTab({
      url: '/pages/records/index'
    });
  };

  const handleFavoritesClick = () => {
    Taro.switchTab({
      url: '/pages/favorites/index'
    });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.welcome}>🐾 宠物知识问答</Text>
        <Text className={styles.subtitle}>新手养宠，从这里开始</Text>
      </View>

      <View style={{ padding: '0 32rpx' }}>
        <SearchBar 
          placeholder="输入你的问题..." 
          onSearch={handleSearch}
        />
      </View>

      <View className={styles.section} style={{ padding: '0 32rpx' }}>
        <View className={styles.quizBanner} onClick={handleQuizClick}>
          <View className={styles.quizContent}>
            <Text className={styles.quizTitle}>📝 每日养宠小测</Text>
            <Text className={styles.quizDesc}>测试一下你对宠物知识了解多少</Text>
          </View>
          <Text className={styles.quizButton}>开始测试</Text>
        </View>
      </View>

      <View className={styles.section} style={{ padding: '0 32rpx' }}>
        <Text className={styles.sectionTitle}>📚 知识分类</Text>
        <View className={styles.categoryGrid}>
          {categories.map(cat => (
            <View 
              key={cat.id} 
              className={styles.categoryItem}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <Text className={styles.categoryIcon}>{cat.icon}</Text>
              <Text className={styles.categoryName}>{cat.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section} style={{ padding: '0 32rpx' }}>
        <View className={styles.sectionTitle}>
          <Text>🔥 热门问题</Text>
          <Text className={styles.viewMore} onClick={() => handleCategoryClick('all')}>查看更多</Text>
        </View>
        {hotQuestions.map(question => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </View>

      <View className={styles.section} style={{ padding: '0 32rpx' }}>
        <Text className={styles.sectionTitle}>⚡ 快捷入口</Text>
        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={handleRecordsClick}>
            <Text className={styles.actionIcon}>📋</Text>
            <View className={styles.actionText}>
              <Text className={styles.actionTitle}>我的记录</Text>
              <Text className={styles.actionDesc}>查看已读问题和学习进度</Text>
            </View>
          </View>
          <View className={styles.actionItem} onClick={handleFavoritesClick}>
            <Text className={styles.actionIcon}>❤️</Text>
            <View className={styles.actionText}>
              <Text className={styles.actionTitle}>我的收藏</Text>
              <Text className={styles.actionDesc}>收藏感兴趣的问题</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <Text className={styles.footerText}>有问题随时问，养宠更轻松</Text>
      </View>
    </ScrollView>
  );
};

export default HomePage;
