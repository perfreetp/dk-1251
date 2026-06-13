import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import QuestionCard from '@/components/QuestionCard';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';
import { Question } from '@/types';
import styles from './index.module.scss';

const CategoryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPet, setSelectedPet] = useState<string>('all');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(questions);

  useEffect(() => {
    const eventChannel = Taro.getCurrentInstance().page?.getOpenerEventChannel();
    if (eventChannel?.on) {
      eventChannel.on('dataReceived', (data) => {
        if (data.category) {
          setSelectedCategory(data.category);
        }
      });
    }
  }, []);

  useEffect(() => {
    let filtered = [...questions];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }
    
    if (selectedPet !== 'all') {
      filtered = filtered.filter(q => 
        q.applicablePet === selectedPet || q.applicablePet === 'both'
      );
    }
    
    setFilteredQuestions(filtered);
  }, [selectedCategory, selectedPet]);

  const getCategoryName = () => {
    if (selectedCategory === 'all') return '全部问题';
    const cat = categories.find(c => c.id === selectedCategory);
    return cat?.name || '问题列表';
  };

  const getCategoryDesc = () => {
    if (selectedCategory === 'all') return '浏览所有宠物知识';
    const cat = categories.find(c => c.id === selectedCategory);
    return cat?.description || '';
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.categoryTitle}>{getCategoryName()}</Text>
        <Text className={styles.categoryDesc}>{getCategoryDesc()}</Text>
      </View>

      <View className={styles.filterBar}>
        <View 
          className={`${styles.filterItem} ${selectedPet === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedPet('all')}
        >
          全部
        </View>
        <View 
          className={`${styles.filterItem} ${selectedPet === 'cat' ? styles.active : ''}`}
          onClick={() => setSelectedPet('cat')}
        >
          🐱 猫咪
        </View>
        <View 
          className={`${styles.filterItem} ${selectedPet === 'dog' ? styles.active : ''}`}
          onClick={() => setSelectedPet('dog')}
        >
          🐶 狗狗
        </View>
      </View>

      <View className={styles.questionList}>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(question => (
            <QuestionCard key={question.id} question={question} />
          ))
        ) : (
          <View className={styles.noResults}>
            <Text className={styles.noResultsText}>暂无相关问题</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CategoryPage;
