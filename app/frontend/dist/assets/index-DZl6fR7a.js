// ============================================================
// THIS IS THE BUILT/BUNDLED VERSION OF ALL REACT CODE
// ============================================================
// In a real build, this would be:
// - All of React library code
// - All of your App.jsx code
// - Minified into unreadable compressed JavaScript
// - Typically 150-200KB for a small app
//
// For this learning project, we keep it readable.
// In production, you'd see something like:
//   !function(e){var t={};function n(r){if(t[r])return...
// (completely unreadable — and that's fine, browsers read it)
// ============================================================

import{useState as s,useEffect as a}from"/assets/vendor-BkRPqKMz.js";

// Simplified version for learning purposes
// The real bundled file would be minified and unreadable
const App = () => {
    const [tasks, setTasks] = s([]);
    const [newTask, setNewTask] = s('');
    const [loading, setLoading] = s(true);

    a(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        const r = await fetch('/api/tasks');
        const d = await r.json();
        setTasks(d);
        setLoading(false);
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const r = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTask })
        });
        const t = await r.json();
        setTasks([t, ...tasks]);
        setNewTask('');
    };

    const toggleTask = async (id, completed) => {
        const r = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });
        const u = await r.json();
        setTasks(tasks.map(t => t._id === id ? u : t));
    };

    const deleteTask = async (id) => {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        setTasks(tasks.filter(t => t._id !== id));
    };

    // Render (creates HTML in browser)
    // ... React rendering code would be here
};

export default App;
