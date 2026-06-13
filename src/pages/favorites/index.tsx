import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import QuestionCard from '@/components/QuestionCard';
import { useAppContext } from '@/store/context';
import { questions } from '@/data/questions';
import styles from './index.module.scss';

const FavoritesPage: React.FC = () => {
  const { favorites } = useAppContext();

  const favoriteQuestions = questions.filter(q => favorites.includes(q.id));

  const handleBrowse = () => {
    Taro.switchTab({
      url: '/pages/home/index'
    });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>❤️ 我的收藏</Text>
        <Text className={styles.subtitle}>共 {favoriteQuestions.length} 个收藏</Text>
      </View>

      {favoriteQuestions.length > 0 ? (
        <View className={styles.listContainer}>
          {favoriteQuestions.map(question => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>💝</Text>
          <Text className={styles.emptyTitle}>暂无收藏</Text>
          <Text className={styles.emptyDesc}>收藏感兴趣的问题，方便随时查看</Text>
          <View className={styles.browseButton} onClick={handleBrowse}>
            <Text style={{ color: '#fff', fontSize: '28rpx' }}>去浏览问题</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default FavoritesPage;
