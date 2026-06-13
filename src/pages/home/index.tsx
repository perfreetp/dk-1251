import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SearchBar from '@/components/SearchBar';
import QuestionCard from '@/components/QuestionCard';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';
import { Question } from '@/types';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as any).options || {};
    
    if (options.search) {
      const keyword = decodeURIComponent(options.search);
      setSearchKeyword(keyword);
      performSearch(keyword);
    }
  }, []);

  const performSearch = (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lowerKeyword = keyword.toLowerCase();
    
    const results = questions.filter(q => {
      return (
        q.title.toLowerCase().includes(lowerKeyword) ||
        q.content.toLowerCase().includes(lowerKeyword) ||
        q.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
      );
    });

    setSearchResults(results);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      performSearch(keyword);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setSearchResults([]);
    setIsSearching(false);
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

  const hotQuestions = questions.slice(0, 3);

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.welcome}>🐾 宠物知识问答</Text>
        <Text className={styles.subtitle}>新手养宠，从这里开始</Text>
      </View>

      <View style={{ padding: '0 32rpx' }}>
        <SearchBar 
          placeholder="输入你的问题或关键词..." 
          onSearch={handleSearch}
        />
      </View>

      {isSearching && (
        <View className={styles.section} style={{ padding: '0 32rpx' }}>
          <View className={styles.searchHeader}>
            <Text className={styles.searchTitle}>
              搜索"{searchKeyword}"的结果
            </Text>
            <Text className={styles.searchCount}>
              共找到 {searchResults.length} 条相关问题
            </Text>
          </View>
          
          {searchResults.length > 0 ? (
            <View>
              {searchResults.map(question => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </View>
          ) : (
            <View className={styles.emptySearch}>
              <Text className={styles.emptyIcon}>🔍</Text>
              <Text className={styles.emptyTitle}>未找到相关问题</Text>
              <Text className={styles.emptyDesc}>
                没有找到与"{searchKeyword}"相关的问题
              </Text>
              <Text className={styles.emptyDesc}>
                试试其他关键词，或浏览以下热门问题：
              </Text>
            </View>
          )}

          <View 
            className={styles.clearSearchButton}
            onClick={handleClearSearch}
          >
            <Text>清除搜索，回到首页</Text>
          </View>
        </View>
      )}

      {!isSearching && (
        <>
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
        </>
      )}
    </ScrollView>
  );
};

export default HomePage;
