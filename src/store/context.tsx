import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Question, TodoItem } from '@/types';

interface AppContextType {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  readQuestions: Set<string>;
  markAsRead: (id: string) => void;
  isRead: (id: string) => boolean;
  todos: TodoItem[];
  addTodo: (content: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  searchResults: Question[];
  setSearchResults: (results: Question[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [readQuestions, setReadQuestions] = useState<Set<string>>(new Set());
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [searchResults, setSearchResults] = useState<Question[]>([]);

  const addFavorite = (id: string) => {
    setFavorites(prev => [...prev, id]);
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(fid => fid !== id));
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const markAsRead = (id: string) => {
    setReadQuestions(prev => new Set(prev).add(id));
  };

  const isRead = (id: string) => readQuestions.has(id);

  const addTodo = (content: string) => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      content,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  return (
    <AppContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      readQuestions,
      markAsRead,
      isRead,
      todos,
      addTodo,
      toggleTodo,
      deleteTodo,
      searchResults,
      setSearchResults
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
