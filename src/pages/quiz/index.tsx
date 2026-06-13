import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizData: QuizItem[] = [
  {
    id: '1',
    question: '幼犬每天应该喂几次？',
    options: ['1次', '2次', '3-4次', '5次以上'],
    correctAnswer: 2,
    explanation: '幼犬的胃容量较小，需要少食多餐。建议每天喂3-4次，随着年龄增长可以逐渐减少到每天2次。'
  },
  {
    id: '2',
    question: '猫咪可以喝牛奶吗？',
    options: ['可以', '不可以', '偶尔可以', '只有幼猫可以'],
    correctAnswer: 1,
    explanation: '大多数猫咪有乳糖不耐症，无法消化牛奶中的乳糖，可能导致腹泻。建议使用宠物专用奶或清水。'
  },
  {
    id: '3',
    question: '宠物驱虫的频率是多久一次？',
    options: ['每周一次', '每月一次', '每季度一次', '每年一次'],
    correctAnswer: 1,
    explanation: '体外驱虫建议每月一次，特别是春夏季节。体内驱虫幼年宠物每月一次，成年宠物每3个月一次。'
  },
  {
    id: '4',
    question: '狗狗疫苗接种第一针应该在什么时候？',
    options: ['出生时', '2周龄', '6-8周龄', '3月龄以上'],
    correctAnswer: 2,
    explanation: '幼犬通常在6-8周龄开始接种第一针传染病疫苗。接种前要确保狗狗身体健康。'
  },
  {
    id: '5',
    question: '以下哪种食物对宠物有毒？',
    options: ['苹果（去核）', '葡萄', '胡萝卜', '西兰花'],
    correctAnswer: 1,
    explanation: '葡萄和葡萄干对狗狗有毒，可能导致急性肾衰竭。洋葱、巧克力、木糖醇等也对宠物有毒。'
  }
];

const QuizPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const quiz = quizData[currentQuestion];
  const progress = ((currentQuestion) / quizData.length) * 100;

  const handleOptionClick = (index: number) => {
    if (answered) return;
    
    setSelectedAnswer(index);
    setAnswered(true);
    setShowExplanation(true);
    
    if (index === quiz.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
  };

  const getOptionClass = (index: number) => {
    if (!answered) return styles.option;
    
    if (index === quiz.correctAnswer) {
      return `${styles.option} ${styles.correct}`;
    }
    
    if (index === selectedAnswer && index !== quiz.correctAnswer) {
      return `${styles.option} ${styles.incorrect}`;
    }
    
    return styles.option;
  };

  const getOptionLetterClass = (index: number) => {
    if (selectedAnswer === index) {
      return `${styles.optionLetter} ${styles.selected}`;
    }
    return styles.optionLetter;
  };

  if (showResult) {
    const percentage = Math.round((score / quizData.length) * 100);
    const emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';
    const message = percentage >= 80 
      ? '太棒了！你对宠物知识了解得很透彻！' 
      : percentage >= 60 
      ? '还不错，继续学习更多宠物知识吧！' 
      : '加油！建议多看看我们的知识问答内容哦！';

    return (
      <View className={styles.container}>
        <View className={styles.header}>
          <Text className={styles.title}>测试结果</Text>
        </View>

        <View className={styles.resultCard}>
          <Text className={styles.resultIcon}>{emoji}</Text>
          <Text className={styles.resultTitle}>测试完成！</Text>
          <Text className={styles.resultScore}>{score} / {quizData.length}</Text>
          <Text className={styles.resultMessage}>{message}</Text>
          <View className={styles.retryButton} onClick={handleRetry}>
            <Text style={{ color: '#fff', fontSize: '28rpx' }}>再测一次</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>📝 每日养宠小测</Text>
        <Text className={styles.subtitle}>测试一下你的宠物知识</Text>
      </View>

      <View className={styles.progress}>
        <Text className={styles.progressText}>
          第 {currentQuestion + 1} 题 / 共 {quizData.length} 题
        </Text>
        <View className={styles.progressBar}>
          <View 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          ></View>
        </View>
      </View>

      <View className={styles.questionCard}>
        <Text className={styles.questionNumber}>问题 {currentQuestion + 1}</Text>
        <Text className={styles.questionText}>{quiz.question}</Text>

        <View className={styles.optionsList}>
          {quiz.options.map((option, index) => (
            <View
              key={index}
              className={getOptionClass(index)}
              onClick={() => handleOptionClick(index)}
            >
              <View className={getOptionLetterClass(index)}>
                <Text>{String.fromCharCode(65 + index)}</Text>
              </View>
              <Text className={styles.optionText}>{option}</Text>
            </View>
          ))}
        </View>

        {showExplanation && (
          <View className={styles.explanation}>
            <Text className={styles.explanationTitle}>💡 解析</Text>
            <Text className={styles.explanationText}>{quiz.explanation}</Text>
          </View>
        )}

        <View 
          className={`${styles.nextButton} ${!answered ? styles.disabled : ''}`}
          onClick={answered ? handleNext : undefined}
        >
          <Text style={{ color: answered ? '#fff' : '#C9CDD4', fontSize: '28rpx' }}>
            {currentQuestion < quizData.length - 1 ? '下一题' : '查看结果'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default QuizPage;
