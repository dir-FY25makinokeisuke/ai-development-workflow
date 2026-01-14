'use client';

import { useState } from 'react';

type TaskStatus = 'Pending' | 'Running' | 'Completed';

interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  subtasks: SubTask[];
  isEditing?: boolean;
  showSubtasks?: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        status: 'Pending',
        subtasks: [],
        showSubtasks: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const startEditingTask = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditingTaskTitle(currentTitle);
  };

  const saveTaskEdit = (taskId: string) => {
    if (editingTaskTitle.trim()) {
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, title: editingTaskTitle } : task
      ));
    }
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const cancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const toggleSubtasks = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, showSubtasks: !task.showSubtasks } : task
    ));
  };

  const addSubtask = (taskId: string, subtaskTitle: string) => {
    if (subtaskTitle.trim()) {
      const newSubtask: SubTask = {
        id: Date.now().toString(),
        title: subtaskTitle,
        status: 'Pending',
      };
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      ));
    }
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, subtasks: task.subtasks.filter(st => st.id !== subtaskId) }
        : task
    ));
  };

  const updateSubtaskStatus = (taskId: string, subtaskId: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(st =>
              st.id === subtaskId ? { ...st, status } : st
            ),
          }
        : task
    ));
  };

  const updateSubtaskTitle = (taskId: string, subtaskId: string, newTitle: string) => {
    if (newTitle.trim()) {
      setTasks(tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(st =>
                st.id === subtaskId ? { ...st, title: newTitle } : st
              ),
            }
          : task
      ));
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Running':
        return 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Completed':
        return 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          TODO管理アプリ
        </h1>

        {/* タスク追加フォーム */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={addTask}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              追加
            </button>
          </div>
        </div>

        {/* タスクリスト */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  {editingTaskId === task.id ? (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={editingTaskTitle}
                        onChange={(e) => setEditingTaskTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveTaskEdit(task.id)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => saveTaskEdit(task.id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelTaskEdit}
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {task.title}
                    </h3>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {['Pending', 'Running', 'Completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateTaskStatus(task.id, status as TaskStatus)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        disabled={task.status === status}
                      >
                        → {status}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditingTask(task.id, task.title)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      削除
                    </button>
                    <button
                      onClick={() => toggleSubtasks(task.id)}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                    >
                      {task.showSubtasks ? 'サブタスクを非表示' : `サブタスクを表示 (${task.subtasks.length})`}
                    </button>
                  </div>
                </div>
              </div>

              {/* サブタスク */}
              {task.showSubtasks && (
                <div className="mt-4 ml-6 border-l-2 border-gray-300 dark:border-gray-600 pl-6">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="サブタスクを追加..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          addSubtask(task.id, input.value);
                          input.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    {task.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={subtask.title}
                            onChange={(e) => updateSubtaskTitle(task.id, subtask.id, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white text-sm"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subtask.status)}`}>
                            {subtask.status}
                          </span>
                          {['Pending', 'Running', 'Completed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateSubtaskStatus(task.id, subtask.id, status as TaskStatus)}
                              className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                              disabled={subtask.status === status}
                            >
                              → {status}
                            </button>
                          ))}
                          <button
                            onClick={() => deleteSubtask(task.id, subtask.id)}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline ml-auto"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              タスクがありません。上のフォームから新しいタスクを追加してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
