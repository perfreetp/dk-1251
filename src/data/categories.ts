import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'feeding',
    name: '喂养',
    icon: '🍖',
    description: '宠物饮食指南',
    questionCount: 15
  },
  {
    id: 'cleaning',
    name: '清洁',
    icon: '🛁',
    description: '日常清洁护理',
    questionCount: 12
  },
  {
    id: 'deworming',
    name: '驱虫',
    icon: '💊',
    description: '驱虫知识与药物',
    questionCount: 10
  },
  {
    id: 'vaccine',
    name: '疫苗',
    icon: '💉',
    description: '疫苗接种指南',
    questionCount: 8
  },
  {
    id: 'behavior',
    name: '行为',
    icon: '🎾',
    description: '宠物行为训练',
    questionCount: 18
  },
  {
    id: 'emergency',
    name: '应急',
    icon: '🚑',
    description: '紧急情况处理',
    questionCount: 11
  }
];
