// ============================================================
// src/App.jsx — THE MAIN REACT COMPONENT
// ============================================================
// This is what the DEVELOPER writes. You don't deploy this file.
// After "npm run build", this becomes minified JS in dist/assets/
//
// Think of React components like JSP pages:
// - They define what the user SEES (HTML)
// - They handle user actions (button clicks)
// - They fetch data from the backend API
//
// YOU DON'T NEED TO UNDERSTAND THIS IN DETAIL.
// Just know: it calls /api/tasks to get/create/update/delete tasks.
// ============================================================

import { useState, useEffect } from 'react';
import './App.css';

function App() {
    // "state" = data that the component remembers
    // When state changes, the page updates automatically (no refresh!)
    const [tasks, setTasks] = useState([]);         // List of tasks
    const [newTask, setNewTask] = useState('');      // Text in the input box
    const [loading, setLoading] = useState(true);    // Show loading spinner?

    // This runs ONCE when the page loads (like window.onload)
    // It fetches all tasks from the backend API
    useEffect(() => {
        fetchTasks();
    }, []);

    // ---- Fetch all tasks from backend ----
    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks');  // GET /api/tasks
            const data = await response.json();
            setTasks(data);      // Store tasks in state → page updates
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // ---- Create a new task ----
    const addTask = async (e) => {
        e.preventDefault();  // Don't refresh page on form submit
        if (!newTask.trim()) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',                              // POST request
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTask })     // Send task title
            });
            const task = await response.json();
            setTasks([task, ...tasks]);  // Add new task to the list
            setNewTask('');              // Clear input box
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    // ---- Toggle task complete/incomplete ----
    const toggleTask = async (id, completed) => {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !completed })
            });
            const updatedTask = await response.json();
            setTasks(tasks.map(t => t._id === id ? updatedTask : t));
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    // ---- Delete a task ----
    const deleteTask = async (id) => {
        try {
            await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            setTasks(tasks.filter(t => t._id !== id));  // Remove from list
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    // ---- What the user sees (HTML) ----
    // JSX = HTML inside JavaScript (React's template language)
    return (
        <div className="app">
            <h1>Task Manager</h1>

            <form onSubmit={addTask} className="add-form">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                />
                <button type="submit">Add</button>
            </form>

            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <ul className="task-list">
                    {tasks.map(task => (
                        <li key={task._id} className={task.completed ? 'completed' : ''}>
                            <span onClick={() => toggleTask(task._id, task.completed)}>
                                {task.completed ? '✅' : '⬜'} {task.title}
                            </span>
                            <button onClick={() => deleteTask(task._id)} className="delete-btn">
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {!loading && tasks.length === 0 && (
                <p className="empty">No tasks yet. Add one above!</p>
            )}
        </div>
    );
}

export default App;
