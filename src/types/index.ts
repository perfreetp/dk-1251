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
  category?: string;
  dueDate?: string;
  note?: string;
}

export interface ReadRecord {
  questionId: string;
  read: boolean;
  readAt?: string;
  manuallySet?: boolean;
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

export interface DailyStats {
  date: string;
  readCount: number;
  completedTodos: number;
  categoryBreakdown: Record<string, number>;
}

export interface WeekStats {
  weekNumber: number;
  year: number;
  days: DayStats[];
  totalReads: number;
  totalCompletedTodos: number;
  categoryBreakdown: Record<string, number>;
}

export interface DayStats {
  date: string;
  dayOfWeek: string;
  readCount: number;
  completedTodos: number;
  categories: Record<string, number>;
}
