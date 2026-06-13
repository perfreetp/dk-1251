import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Category } from '@/types';
import styles from './index.module.scss';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/category/index?category=${category.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <Text className={styles.icon}>{category.icon}</Text>
      <View className={styles.info}>
        <Text className={styles.name}>{category.name}</Text>
        <Text className={styles.description}>{category.description}</Text>
      </View>
      <Text className={styles.count}>{category.questionCount}题</Text>
    </View>
  );
};

export default CategoryCard;
