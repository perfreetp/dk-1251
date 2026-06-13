import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import QuestionCard from '@/components/QuestionCard';
import { useAppContext } from '@/store/context';
import { questions } from '@/data/questions';
import { Question } from '@/types';
import styles from './index.module.scss';

const FavoritesPage: React.FC = () => {
  const { favorites } = useAppContext();
  const [searchKeyword, setSearchKeyword] = useState('');

  const favoriteQuestions = questions.filter(q => favorites.includes(q.id));

  const filteredQuestions = searchKeyword.trim()
    ? favoriteQuestions.filter(q => {
        const keyword = searchKeyword.toLowerCase();
        return (
          q.title.toLowerCase().includes(keyword) ||
          q.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      })
    : favoriteQuestions;

  const handleSearchInput = (e) => {
    setSearchKeyword(e.detail.value);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
  };

  const handleBrowse = () => {
    Taro.switchTab({
      url: '/pages/home/index'
    });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>❤️ 我的收藏</Text>
        <Text className={styles.subtitle}>
          {searchKeyword ? `搜索"${searchKeyword}"的结果` : `共 ${favoriteQuestions.length} 个收藏`}
        </Text>
      </View>

      <View className={styles.searchContainer}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索收藏的题目或标签..."
            value={searchKeyword}
            onInput={handleSearchInput}
          />
          {searchKeyword && (
            <Text className={styles.clearIcon} onClick={handleClearSearch}>×</Text>
          )}
        </View>
      </View>

      {filteredQuestions.length > 0 ? (
        <View className={styles.listContainer}>
          {filteredQuestions.map(question => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          {searchKeyword ? (
            <>
              <Text className={styles.emptyIcon}>🔍</Text>
              <Text className={styles.emptyTitle}>未找到匹配结果</Text>
              <Text className={styles.emptyDesc}>
                没有找到与"{searchKeyword}"相关的收藏
              </Text>
              <View className={styles.clearSearchButton} onClick={handleClearSearch}>
                <Text style={{ color: '#FF9B6A', fontSize: '28rpx' }}>清除搜索</Text>
              </View>
            </>
          ) : (
            <>
              <Text className={styles.emptyIcon}>💝</Text>
              <Text className={styles.emptyTitle}>暂无收藏</Text>
              <Text className={styles.emptyDesc}>收藏感兴趣的问题，方便随时查看</Text>
              <View className={styles.browseButton} onClick={handleBrowse}>
                <Text style={{ color: '#fff', fontSize: '28rpx' }}>去浏览问题</Text>
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default FavoritesPage;
