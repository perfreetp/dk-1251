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
  dueDate?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface UserRecord {
  questionId: string;
  readAt: string;
  read: boolean;
}
