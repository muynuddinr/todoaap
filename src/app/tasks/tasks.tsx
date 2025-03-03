'use client';
import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import Toast from '../Components/Toast';
import Modal from '../Components/Modal';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Add new state for stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    urgent: 0
  });

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Calculate stats whenever tasks change
    const completed = tasks.filter(task => task.completed).length;
    const urgent = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate <= today && !task.completed;
    }).length;

    setStats({
      total: tasks.length,
      completed: completed,
      pending: tasks.length - completed,
      urgent: urgent
    });
  }, [tasks]);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Add new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !category.trim() || !dueDate) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask,
          category,
          description,
          dueDate: new Date(dueDate).toISOString(),
          completed: false
        }),
      });

      if (response.ok) {
        const task = await response.json();
        setTasks([...tasks, task]);
        setNewTask('');
        setCategory('');
        setDescription('');
        setDueDate('');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Toggle task completion
  const toggleTaskComplete = async (taskId: string) => {
    try {
      const taskToUpdate = tasks.find((task) => task._id === taskId);
      if (!taskToUpdate) return;

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !taskToUpdate.completed }),
      });

      if (response.ok) {
        setTasks(
          tasks.map((task) =>
            task._id === taskId
              ? { ...task, completed: !task.completed }
              : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Add delete task function
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter((task) => task._id !== taskId));
        setToast({ message: 'Task deleted successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to delete task', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to delete task', type: 'error' });
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Header and Stats Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Task Manager</h1>
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4 w-full sm:w-auto">
            <StatCard title="Total Tasks" value={stats.total} color="bg-blue-500" />
            <StatCard title="Completed" value={stats.completed} color="bg-green-500" />
            <StatCard title="Pending" value={stats.pending} color="bg-yellow-500" />
            <StatCard title="Urgent" value={stats.urgent} color="bg-red-500" />
          </div>
        </div>

        {/* Add Task Form */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>
          <form onSubmit={handleAddTask} className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Task title..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              rows={3}
            />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>

        {/* Tasks List */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${
                task.completed ? 'border-green-500' : 'border-blue-500'
              }`}
            >
              <div className="flex items-start sm:items-center justify-between mb-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskComplete(task._id)}
                    className="mt-1 sm:mt-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium rounded-full">
                        {task.category}
                      </span>
                      <h3
                        className={`text-base sm:text-lg font-semibold ${
                          task.completed ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTaskToDelete(task._id);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {task.description && (
                <div className="mb-4 pl-10">
                  <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
                </div>
              )}
              <div className="flex items-center gap-4 pl-10">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (taskToDelete) {
            handleDeleteTask(taskToDelete);
          }
        }}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}

// Update StatCard component
function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 min-w-[120px] sm:min-w-[140px]">
      <div className={`${color} w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3`}>
        <span className="text-white text-lg sm:text-xl font-bold">{value}</span>
      </div>
      <h3 className="text-gray-600 text-xs sm:text-sm font-medium">{title}</h3>
    </div>
  );
}
