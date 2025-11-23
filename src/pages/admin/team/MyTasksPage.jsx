import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { Plus, CheckCircle, Clock, AlertCircle, MoreHorizontal, Calendar } from 'lucide-react';

export default function MyTasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, todo, in_progress, done
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_tasks')
                .select('*')
                .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const { data, error } = await supabase
                .from('admin_tasks')
                .insert([{
                    title: newTask,
                    status: 'todo',
                    priority: 'medium',
                    assigned_to: user.id,
                    created_by: user.id
                }])
                .select()
                .single();

            if (error) throw error;
            setTasks([data, ...tasks]);
            setNewTask('');
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const { error } = await supabase
                .from('admin_tasks')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', taskId);

            if (error) throw error;
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-orange-600 bg-orange-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                    <p className="text-gray-500">Track your daily activities and assignments</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Tasks</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Completed</option>
                    </select>
                </div>
            </div>

            {/* Quick Add */}
            <form onSubmit={handleAddTask} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 border-none focus:ring-0 text-gray-900 placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={!newTask.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    Add Task
                </button>
            </form>

            {/* Task List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading tasks...</div>
                ) : filteredTasks.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                        <p className="text-gray-500 mt-1">You're all caught up! Add a new task to get started.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 group">
                                <button
                                    onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                                    className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'done'
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-gray-300 hover:border-indigo-500'
                                        }`}
                                >
                                    {task.status === 'done' && <CheckCircle size={16} />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className={`px-2 py-0.5 rounded-full capitalize ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        {task.due_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <select
                                        value={task.status}
                                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                    <button className="p-1 text-gray-400 hover:text-red-600">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
