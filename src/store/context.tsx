import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { Question, TodoItem, ReadRecord } from '@/types';

interface AppContextType {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  readRecords: ReadRecord[];
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  toggleRead: (id: string) => void;
  isRead: (id: string) => boolean;
  getReadTime: (id: string) => string | undefined;
  todos: TodoItem[];
  addTodo: (content: string, relatedQuestionId?: string, category?: string, dueDate?: string, note?: string) => void;
  updateTodo: (id: string, updates: Partial<TodoItem>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  getTodo: (id: string) => TodoItem | undefined;
  batchUpdateTodos: (ids: string[], updates: Partial<TodoItem>) => void;
  searchResults: Question[];
  setSearchResults: (results: Question[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FAVORITES: 'pet_app_favorites',
  READ_RECORDS: 'pet_app_read_records',
  TODOS: 'pet_app_todos'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [readRecords, setReadRecords] = useState<ReadRecord[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedFavorites = Taro.getStorageSync(STORAGE_KEYS.FAVORITES);
      if (storedFavorites && Array.isArray(storedFavorites)) {
        setFavorites(storedFavorites);
      }

      const storedReadRecords = Taro.getStorageSync(STORAGE_KEYS.READ_RECORDS);
      if (storedReadRecords && Array.isArray(storedReadRecords)) {
        setReadRecords(storedReadRecords);
      }

      const storedTodos = Taro.getStorageSync(STORAGE_KEYS.TODOS);
      if (storedTodos && Array.isArray(storedTodos)) {
        setTodos(storedTodos);
      }
    } catch (error) {
      console.error('[AppContext] Failed to load data from storage:', error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      Taro.setStorageSync(STORAGE_KEYS.FAVORITES, favorites);
    } catch (error) {
      console.error('[AppContext] Failed to save favorites:', error);
    }
  }, [favorites, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      Taro.setStorageSync(STORAGE_KEYS.READ_RECORDS, readRecords);
    } catch (error) {
      console.error('[AppContext] Failed to save read records:', error);
    }
  }, [readRecords, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      Taro.setStorageSync(STORAGE_KEYS.TODOS, todos);
    } catch (error) {
      console.error('[AppContext] Failed to save todos:', error);
    }
  }, [todos, isInitialized]);

  const addFavorite = (id: string) => {
    if (!favorites.includes(id)) {
      setFavorites(prev => [...prev, id]);
    }
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(fid => fid !== id));
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const markAsRead = (id: string, forceUpdate = false) => {
    setReadRecords(prev => {
      const existing = prev.find(r => r.questionId === id);
      if (existing) {
        if (existing.manuallySet && !forceUpdate) {
          return prev;
        }
        return prev.map(r => 
          r.questionId === id 
            ? { ...r, read: true, readAt: r.readAt || new Date().toISOString(), manuallySet: false }
            : r
        );
      }
      return [...prev, { questionId: id, read: true, readAt: new Date().toISOString(), manuallySet: false }];
    });
  };

  const markAsUnread = (id: string) => {
    setReadRecords(prev => {
      const existing = prev.find(r => r.questionId === id);
      if (existing) {
        if (existing.manuallySet) {
          return prev.map(r => 
            r.questionId === id 
              ? { ...r, read: false }
              : r
          ).filter(r => r.read);
        }
        return prev.filter(r => r.questionId !== id);
      }
      return prev;
    });
  };

  const toggleRead = (id: string) => {
    const record = readRecords.find(r => r.questionId === id);
    if (record) {
      if (record.read) {
        markAsUnread(id);
      } else {
        markAsRead(id, true);
      }
    } else {
      setReadRecords(prev => [
        ...prev, 
        { questionId: id, read: true, readAt: new Date().toISOString(), manuallySet: true }
      ]);
    }
  };

  const isRead = (id: string) => {
    const record = readRecords.find(r => r.questionId === id);
    return record ? record.read : false;
  };

  const getReadTime = (id: string): string | undefined => {
    const record = readRecords.find(r => r.questionId === id);
    return record?.readAt;
  };

  const addTodo = (content: string, relatedQuestionId?: string, category?: string, dueDate?: string, note?: string) => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      content,
      completed: false,
      createdAt: new Date().toISOString(),
      relatedQuestionId,
      category,
      dueDate,
      note
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const updateTodo = (id: string, updates: Partial<TodoItem>) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === id) {
        const now = new Date().toISOString();
        return {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? now : undefined
        };
      }
      return todo;
    }));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const getTodo = (id: string): TodoItem | undefined => {
    return todos.find(t => t.id === id);
  };

  const batchUpdateTodos = (ids: string[], updates: Partial<TodoItem>) => {
    setTodos(prev => prev.map(todo =>
      ids.includes(todo.id) ? { ...todo, ...updates } : todo
    ));
  };

  return (
    <AppContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      readRecords,
      markAsRead,
      markAsUnread,
      toggleRead,
      isRead,
      getReadTime,
      todos,
      addTodo,
      updateTodo,
      toggleTodo,
      deleteTodo,
      getTodo,
      batchUpdateTodos,
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
