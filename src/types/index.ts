export interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  applicablePet: 'cat' | 'dog' | 'both';
  ageRange: string;
  precautions: string[];
  seekDoctorSigns: string[];
  misconceptions: string[];
  relatedQuestions: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  questionCount: number;
}

export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  relatedQuestionId?: string;
  dueDate?: string;
}

export interface ReadRecord {
  questionId: string;
  read: boolean;
  readAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LearningOverview {
  totalQuestions: number;
  readQuestions: number;
  readByCategory: Record<string, number>;
  totalFavorites: number;
  totalTodos: number;
  completedTodos: number;
}
