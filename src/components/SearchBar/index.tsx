import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (keyword: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = '搜索问题...',
  onSearch 
}) => {
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(keyword);
    } else {
      Taro.navigateTo({
        url: `/pages/home/index?search=${encodeURIComponent(keyword)}`
      });
    }
  };

  const handleInput = (e) => {
    setKeyword(e.detail.value);
  };

  return (
    <View className={styles.container}>
      <View className={styles.searchBox}>
        <Text className={styles.icon}>🔍</Text>
        <Input
          className={styles.input}
          placeholder={placeholder}
          value={keyword}
          onInput={handleInput}
          onConfirm={handleSearch}
        />
      </View>
      <View className={styles.button} onClick={handleSearch}>
        <Text className={styles.buttonText}>搜索</Text>
      </View>
    </View>
  );
};

export default SearchBar;
