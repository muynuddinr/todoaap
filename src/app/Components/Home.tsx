'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaCheck, FaTasks, FaCheckCircle, FaClock } from 'react-icons/fa';
import Toast from './Toast';
import Modal from './Modal';

interface Todo {
  _id: string;
  text: string;
  completed: boolean;
}

interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    // Update stats whenever todos change
    const completed = todos.filter(todo => todo.completed).length;
    setStats({
      total: todos.length,
      completed,
      pending: todos.length - completed
    });
  }, [todos]);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        console.error('Expected array of todos but got:', data);
        setTodos([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setTodos([]);
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTodo }),
      });
      const data = await response.json();
      setTodos([...todos, data]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find((t) => t._id === id);
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo?.completed }),
      });
      setTodos(
        todos.map((todo) =>
          todo._id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter((todo) => todo._id !== id));
        setToast({ message: 'Todo deleted successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to delete todo', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      setToast({ message: 'Failed to delete todo', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-purple-100"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            My Todo List
          </h1>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/90 p-4 sm:p-6 rounded-xl shadow-md border border-purple-100 transform transition-all duration-200"
            >
              <FaTasks className="w-7 h-7 text-purple-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-purple-600 text-sm font-medium">Total Tasks</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 p-4 sm:p-6 rounded-xl shadow-md border border-green-100 transform transition-all duration-200"
            >
              <FaCheckCircle className="w-7 h-7 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-green-600 text-sm font-medium">Completed</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 p-4 sm:p-6 rounded-xl shadow-md border border-yellow-100 transform transition-all duration-200"
            >
              <FaClock className="w-7 h-7 text-yellow-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-yellow-600 text-sm font-medium">Pending</div>
            </motion.div>
          </div>

          <form onSubmit={addTodo} className="mb-6 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center sm:justify-start gap-2 shadow-md"
            >
              <FaPlus /> Add
            </motion.button>
          </form>

          {loading ? (
            <div className="text-center text-gray-500 text-lg">Loading...</div>
          ) : (
            <motion.ul className="space-y-3 sm:space-y-4">
              {todos.map((todo, index) => (
                <motion.li
                  key={todo._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:bg-white transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTodo(todo._id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        todo.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {todo.completed && <FaCheck className="text-white text-sm" />}
                    </button>
                    <span
                      className={`${
                        todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                      } truncate`}
                    >
                      {todo.text}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTodoToDelete(todo._id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-500 hover:text-red-600 flex-shrink-0 ml-2"
                  >
                    <FaTrash />
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>
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
          if (todoToDelete) {
            deleteTodo(todoToDelete);
          }
        }}
        title="Delete Todo"
        message="Are you sure you want to delete this todo? This action cannot be undone."
      />
    </div>
  );
}
