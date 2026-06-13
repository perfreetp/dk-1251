import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Question } from '@/types';
import { useAppContext } from '@/store/context';
import styles from './index.module.scss';

interface QuestionCardProps {
  question: Question;
  showReadStatus?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, showReadStatus = true }) => {
  const { isRead, isFavorite } = useAppContext();

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${question.id}`
    });
  };

  const getPetIcon = () => {
    if (question.applicablePet === 'cat') return '🐱';
    if (question.applicablePet === 'dog') return '🐶';
    return '🐱🐶';
  };

  const readStatus = isRead(question.id);
  const favoriteStatus = isFavorite(question.id);

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.title}>{question.title}</Text>
        {favoriteStatus && <Text className={styles.favoriteIcon}>❤️</Text>}
      </View>
      
      <Text className={styles.content}>{question.content}</Text>
      
      <View className={styles.footer}>
        <View className={styles.tags}>
          <Text className={styles.tag}>{getPetIcon()}</Text>
          <Text className={styles.tag}>{question.ageRange}</Text>
          {question.tags.slice(0, 2).map(tag => (
            <Text key={tag} className={styles.tag}>{tag}</Text>
          ))}
        </View>
        {showReadStatus && readStatus && (
          <Text className={styles.readStatus}>✓ 已读</Text>
        )}
      </View>
    </View>
  );
};

export default QuestionCard;
