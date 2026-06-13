import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '@/store/context';
import { questions } from '@/data/questions';
import { categories } from '@/data/categories';
import { TodoItem } from '@/types';
import styles from './index.module.scss';

type TabType = 'overview' | 'read' | 'todo';
type TodoFilter = 'all' | 'today' | 'overdue' | 'completed';
type ReadFilter = 'all' | 'time' | 'category';

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [newTodo, setNewTodo] = useState('');
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('time');
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [todoNote, setTodoNote] = useState('');
  const [relatedQuestionId, setRelatedQuestionId] = useState('');
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const { 
    readRecords, 
    todos, 
    addTodo, 
    updateTodo,
    toggleTodo, 
    deleteTodo,
    toggleRead,
    getReadTime,
    isRead,
    batchUpdateTodos
  } = useAppContext();

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    addTodo(newTodo.trim(), relatedQuestionId || undefined, selectedCategory || undefined, dueDate || undefined, todoNote || undefined);
    resetForm();
    Taro.showToast({ title: '已添加', icon: 'success' });
  };

  const handleUpdateTodo = () => {
    if (!editingTodo || !newTodo.trim()) return;
    updateTodo(editingTodo.id, {
      content: newTodo,
      category: selectedCategory || undefined,
      dueDate: dueDate || undefined,
      note: todoNote || undefined,
      relatedQuestionId: relatedQuestionId || undefined
    });
    resetForm();
    Taro.showToast({ title: '已更新', icon: 'success' });
  };

  const resetForm = () => {
    setNewTodo('');
    setSelectedCategory('');
    setDueDate('');
    setTodoNote('');
    setRelatedQuestionId('');
    setShowAddTodo(false);
    setEditingTodo(null);
    setShowQuestionPicker(false);
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setNewTodo(todo.content);
    setSelectedCategory(todo.category || '');
    setDueDate(todo.dueDate || '');
    setTodoNote(todo.note || '');
    setRelatedQuestionId(todo.relatedQuestionId || '');
    setShowAddTodo(true);
  };

  const readCount = readRecords.filter(r => r.read).length;
  const completedTodos = todos.filter(t => t.completed).length;
  const todayStr = new Date().toISOString().split('T')[0];

  const getIsOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return dueDate < todayStr;
  };

  const getIsToday = (dueDate?: string) => {
    if (!dueDate) return false;
    return dueDate === todayStr;
  };

  const filteredTodos = todos.filter(t => {
    if (todoFilter === 'today') return !t.completed && getIsToday(t.dueDate);
    if (todoFilter === 'overdue') return !t.completed && getIsOverdue(t.dueDate);
    if (todoFilter === 'completed') return t.completed;
    return true;
  });

  const incompleteTodos = todos.filter(t => !t.completed);
  const overdueTodos = incompleteTodos.filter(t => getIsOverdue(t.dueDate));
  const todayTodos = incompleteTodos.filter(t => getIsToday(t.dueDate));
  const completedTodoList = todos.filter(t => t.completed);

  const readQuestionList = questions.filter(q => isRead(q.id));
  const sortedReadQuestions = [...readQuestionList].sort((a, b) => {
    if (readFilter === 'time') {
      const timeA = getReadTime(a.id) || '';
      const timeB = getReadTime(b.id) || '';
      return timeB.localeCompare(timeA);
    } else {
      return a.category.localeCompare(b.category);
    }
  });

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleQuestionClick = (id: string, todoId?: string) => {
    const url = todoId ? `/pages/detail/index?id=${id}&todoId=${todoId}` : `/pages/detail/index?id=${id}`;
    Taro.navigateTo({ url });
  };

  const handleOverviewClick = () => {
    Taro.navigateTo({ url: '/pages/overview/index' });
  };

  const handleViewKnowledgeList = () => {
    Taro.navigateTo({ url: '/pages/quiz/index?view=list' });
  };

  const handleBatchMove = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    const dateStr = newDate.toISOString().split('T')[0];
    batchUpdateTodos(selectedTodos, { dueDate: dateStr });
    setSelectedTodos([]);
    setBatchMode(false);
    Taro.showToast({ title: `已调整到${days === 1 ? '明天' : days === 7 ? '下周' : `${days}天后`}`, icon: 'success' });
  };

  const toggleSelectTodo = (id: string) => {
    setSelectedTodos(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>📋 个人记录</Text>
        <Text className={styles.subtitle}>
          已读 {readCount} 篇 | 待办 {todos.length} 项
        </Text>
      </View>

      <View className={styles.overviewBanner} onClick={handleOverviewClick}>
        <View className={styles.overviewContent}>
          <Text className={styles.overviewIcon}>📊</Text>
          <View className={styles.overviewText}>
            <Text className={styles.overviewTitle}>学习概览</Text>
            <Text className={styles.overviewDesc}>查看分类阅读进度和统计</Text>
          </View>
        </View>
        <Text className={styles.overviewArrow}>›</Text>
      </View>

      <View className={styles.tabs}>
        {(['overview', 'read', 'todo'] as TabType[]).map(tab => (
          <View
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? '概览' : tab === 'read' ? '已读' : '待办'}
          </View>
        ))}
      </View>

      {activeTab === 'overview' && (
        <View className={styles.section}>
          <View className={styles.overviewStats}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{readCount}</Text>
              <Text className={styles.statLabel}>已读</Text>
            </View>
            <View className={styles.statDivider}></View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{completedTodos}</Text>
              <Text className={styles.statLabel}>已完成</Text>
            </View>
            <View className={styles.statDivider}></View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{todos.length - completedTodos}</Text>
              <Text className={styles.statLabel}>待完成</Text>
            </View>
          </View>

          <View className={styles.quickStats}>
            {overdueTodos.length > 0 && (
              <View className={styles.quickStatItem} style={{ borderLeft: '4rpx solid #E74C3C' }}>
                <Text className={styles.quickStatValue} style={{ color: '#E74C3C' }}>{overdueTodos.length}</Text>
                <Text className={styles.quickStatLabel}>已逾期</Text>
              </View>
            )}
            {todayTodos.length > 0 && (
              <View className={styles.quickStatItem} style={{ borderLeft: '4rpx solid #F39C12' }}>
                <Text className={styles.quickStatValue} style={{ color: '#F39C12' }}>{todayTodos.length}</Text>
                <Text className={styles.quickStatLabel}>今日待办</Text>
              </View>
            )}
          </View>

          <View className={styles.knowledgeBanner} onClick={handleViewKnowledgeList}>
            <Text className={styles.knowledgeIcon}>📚</Text>
            <View className={styles.knowledgeText}>
              <Text className={styles.knowledgeTitle}>养宠知识清单</Text>
              <Text className={styles.knowledgeDesc}>按年龄段整理的知识汇总</Text>
            </View>
            <Text className={styles.knowledgeArrow}>›</Text>
          </View>
        </View>
      )}

      {activeTab === 'read' && (
        <View className={styles.section}>
          <View className={styles.readHeader}>
            <Text className={styles.readTitle}>阅读列表</Text>
            <View className={styles.sortButtons}>
              <Text 
                className={`${styles.sortButton} ${readFilter === 'time' ? styles.active : ''}`}
                onClick={() => setReadFilter('time')}
              >按时间</Text>
              <Text 
                className={`${styles.sortButton} ${readFilter === 'category' ? styles.active : ''}`}
                onClick={() => setReadFilter('category')}
              >按分类</Text>
            </View>
          </View>

          {sortedReadQuestions.length > 0 ? (
            <View className={styles.readList}>
              {sortedReadQuestions.map(q => {
                const cat = categories.find(c => c.id === q.category);
                const readTime = getReadTime(q.id);
                return (
                  <View key={q.id} className={styles.readItem}>
                    <View className={styles.readCheckboxChecked} onClick={() => toggleRead(q.id)}>
                      <Text style={{ color: '#fff', fontSize: '24rpx' }}>✓</Text>
                    </View>
                    <View className={styles.readContent} onClick={() => handleQuestionClick(q.id)}>
                      <Text className={styles.readQuestionTitle}>{q.title}</Text>
                      <View className={styles.readMeta}>
                        <Text className={styles.readCategory}>{cat?.icon} {cat?.name}</Text>
                        {readTime && <Text className={styles.readTime}>{formatTime(readTime)}</Text>}
                      </View>
                    </View>
                    <Text className={styles.readArrow}>›</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📖</Text>
              <Text className={styles.emptyText}>还没有已读记录</Text>
            </View>
          )}

          <View className={styles.allQuestionsSection}>
            <Text className={styles.allQuestionsTitle}>添加更多已读</Text>
            {questions.filter(q => !isRead(q.id)).slice(0, 5).map(q => {
              const cat = categories.find(c => c.id === q.category);
              return (
                <View key={q.id} className={styles.readItem}>
                  <View className={styles.readCheckbox} onClick={() => toggleRead(q.id)}></View>
                  <View className={styles.readContent} onClick={() => handleQuestionClick(q.id)}>
                    <Text className={styles.readQuestionTitle}>{q.title}</Text>
                    <View className={styles.readMeta}>
                      <Text className={styles.readCategory}>{cat?.icon} {cat?.name}</Text>
                    </View>
                  </View>
                  <Text className={styles.readArrow}>›</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {activeTab === 'todo' && (
        <View className={styles.section}>
          <View className={styles.todoActions}>
            <View className={styles.addTodoButton} onClick={() => { resetForm(); setShowAddTodo(!showAddTodo); }}>
              <Text className={styles.addTodoIcon}>+</Text>
              <Text className={styles.addTodoText}>{editingTodo ? '编辑计划' : '新建学习计划'}</Text>
            </View>
            {incompleteTodos.length > 0 && (
              <View 
                className={`${styles.batchButton} ${batchMode ? styles.active : ''}`}
                onClick={() => { setBatchMode(!batchMode); setSelectedTodos([]); }}
              >
                <Text>{batchMode ? '取消批量' : '批量操作'}</Text>
              </View>
            )}
          </View>

          {batchMode && selectedTodos.length > 0 && (
            <View className={styles.batchActions}>
              <Text className={styles.batchInfo}>已选择 {selectedTodos.length} 项</Text>
              <View className={styles.batchButtons}>
                <View className={styles.batchBtn} onClick={() => handleBatchMove(1)}>
                  <Text>改到明天</Text>
                </View>
                <View className={styles.batchBtn} onClick={() => handleBatchMove(7)}>
                  <Text>改到下周</Text>
                </View>
              </View>
            </View>
          )}

          {showAddTodo && (
            <View className={styles.addTodoForm}>
              <Input
                className={styles.todoInputField}
                placeholder="计划内容..."
                value={newTodo}
                onInput={e => setNewTodo(e.detail.value)}
              />
              
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>分类</Text>
                <ScrollView className={styles.categoryScroll} scrollX>
                  <View className={styles.categoryTags}>
                    {categories.map(cat => (
                      <View 
                        key={cat.id}
                        className={`${styles.categoryTag} ${selectedCategory === cat.id ? styles.selected : ''}`}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                      >
                        <Text>{cat.icon} {cat.name}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View className={styles.formRow}>
                <Text className={styles.formLabel}>截止日期</Text>
                <Input
                  className={styles.dateInput}
                  type="date"
                  placeholder="选择日期"
                  value={dueDate}
                  onInput={e => setDueDate(e.detail.value)}
                />
              </View>

              <View className={styles.formRow}>
                <Text className={styles.formLabel}>备注</Text>
                <Input
                  className={styles.noteInput}
                  placeholder="简短备注..."
                  value={todoNote}
                  onInput={e => setTodoNote(e.detail.value)}
                />
              </View>

              <View className={styles.formRow}>
                <View className={styles.formLabelRow}>
                  <Text className={styles.formLabel}>关联问题</Text>
                  <Text className={styles.questionCount}>{questions.length}个问题可选</Text>
                </View>
                {showQuestionPicker ? (
                  <View className={styles.questionPicker}>
                    <View className={styles.questionSearch}>
                      <Input
                        className={styles.questionSearchInput}
                        placeholder="搜索问题..."
                        onInput={e => {}}
                      />
                    </View>
                    <ScrollView className={styles.questionList} scrollY>
                      {questions.map(q => (
                        <View 
                          key={q.id}
                          className={`${styles.questionItem} ${relatedQuestionId === q.id ? styles.selected : ''}`}
                          onClick={() => {
                            setRelatedQuestionId(relatedQuestionId === q.id ? '' : q.id);
                            if (!newTodo && relatedQuestionId !== q.id) {
                              setNewTodo(`学习：${q.title}`);
                            }
                          }}
                        >
                          <Text className={styles.questionTitle}>{q.title}</Text>
                          {relatedQuestionId === q.id && <Text className={styles.checkmark}>✓</Text>}
                        </View>
                      ))}
                    </ScrollView>
                    <View className={styles.pickerClose} onClick={() => setShowQuestionPicker(false)}>
                      <Text>收起</Text>
                    </View>
                  </View>
                ) : (
                  <View className={styles.selectQuestionBtn} onClick={() => setShowQuestionPicker(true)}>
                    <Text>{relatedQuestionId ? questions.find(q => q.id === relatedQuestionId)?.title.slice(0, 20) + '...' : '选择关联问题（可选）'}</Text>
                  </View>
                )}
              </View>

              <View className={styles.formButtons}>
                <View className={styles.cancelButton} onClick={resetForm}>
                  <Text>取消</Text>
                </View>
                <View className={styles.confirmButton} onClick={editingTodo ? handleUpdateTodo : handleAddTodo}>
                  <Text style={{ color: '#fff' }}>{editingTodo ? '确认修改' : '确认添加'}</Text>
                </View>
              </View>
            </View>
          )}

          <View className={styles.todoFilters}>
            {([
              { key: 'all', label: '全部' },
              { key: 'today', label: '今日' },
              { key: 'overdue', label: '已逾期' },
              { key: 'completed', label: '已完成' }
            ] as { key: TodoFilter; label: string }[]).map(f => (
              <View 
                key={f.key}
                className={`${styles.filterTag} ${todoFilter === f.key ? styles.active : ''}`}
                onClick={() => setTodoFilter(f.key)}
              >
                <Text>{f.label}</Text>
                {f.key === 'overdue' && overdueTodos.length > 0 && (
                  <View className={styles.badge}><Text>{overdueTodos.length}</Text></View>
                )}
                {f.key === 'today' && todayTodos.length > 0 && (
                  <View className={styles.badge}><Text>{todayTodos.length}</Text></View>
                )}
              </View>
            ))}
          </View>

          {filteredTodos.length > 0 ? (
            <View className={styles.todoList}>
              {filteredTodos.map(todo => {
                const relatedQuestion = todo.relatedQuestionId ? questions.find(q => q.id === todo.relatedQuestionId) : null;
                const cat = todo.category ? categories.find(c => c.id === todo.category) : null;
                const isOverdue = !todo.completed && getIsOverdue(todo.dueDate);
                const isToday = !todo.completed && getIsToday(todo.dueDate);
                const relatedTodos = relatedQuestion ? todos.filter(t => t.relatedQuestionId === relatedQuestion.id) : [];
                const isMultiRelated = relatedTodos.length > 1;
                
                return (
                  <View key={todo.id} className={`${styles.todoItem} ${todo.completed ? styles.completed : ''} ${isOverdue ? styles.overdue : ''}`}>
                    {batchMode && !todo.completed && (
                      <View 
                        className={`${styles.todoSelect} ${selectedTodos.includes(todo.id) ? styles.selected : ''}`}
                        onClick={() => toggleSelectTodo(todo.id)}
                      >
                        {selectedTodos.includes(todo.id) && <Text style={{ color: '#fff', fontSize: '20rpx' }}>✓</Text>}
                      </View>
                    )}
                    <View 
                      className={`${styles.todoCheckbox} ${todo.completed ? styles.checked : ''}`}
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.completed && <Text style={{ color: '#fff', fontSize: '24rpx' }}>✓</Text>}
                    </View>
                    <View className={styles.todoInfo}>
                      <Text className={`${styles.todoContent} ${todo.completed ? styles.completedText : ''}`}>
                        {todo.content}
                      </Text>
                      <View className={styles.todoMeta}>
                        {cat && <Text className={styles.todoTag}>{cat.icon} {cat.name}</Text>}
                        {todo.dueDate && (
                          <Text className={`${styles.todoDue} ${isOverdue ? styles.overdueText : ''} ${isToday ? styles.todayText : ''}`}>
                            {isOverdue ? '已逾期' : isToday ? '今日' : todo.dueDate}
                          </Text>
                        )}
                        {isMultiRelated && (
                          <Text className={styles.multiRelatedBadge}>共{relatedTodos.length}条</Text>
                        )}
                      </View>
                      {todo.note && <Text className={styles.todoNote}>备注: {todo.note}</Text>}
                      {relatedQuestion && (
                        <View 
                          className={styles.todoRelatedQuestion} 
                          onClick={() => handleQuestionClick(relatedQuestion.id, todo.id)}
                        >
                          <Text className={styles.todoRelatedText}>📖 {relatedQuestion.title}</Text>
                          <Text className={styles.todoRelatedHint}>（当前第{relatedTodos.findIndex(t => t.id === todo.id) + 1}条）</Text>
                        </View>
                      )}
                      {todo.completed && todo.completedAt && (
                        <Text className={styles.todoCompletedTime}>✓ 完成于 {formatTime(todo.completedAt)}</Text>
                      )}
                    </View>
                    <View className={styles.todoActions2}>
                      {!batchMode && !todo.completed && (
                        <Text className={styles.editBtn} onClick={() => handleEditTodo(todo)}>编辑</Text>
                      )}
                      <Text className={styles.todoDelete} onClick={() => deleteTodo(todo.id)}>×</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>
                {todoFilter === 'all' ? '暂无待办事项' : 
                 todoFilter === 'today' ? '今日暂无待办' :
                 todoFilter === 'overdue' ? '没有逾期事项' : '暂无已完成'}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default RecordsPage;
