// ============================================================
// routes/tasks.js — API ENDPOINTS (like @RestController in Spring)
// ============================================================
// This file handles all HTTP requests to /api/tasks
//
// It defines:
//   GET    /api/tasks       → Get all tasks
//   POST   /api/tasks       → Create a new task
//   PUT    /api/tasks/:id   → Update a task by ID
//   DELETE /api/tasks/:id   → Delete a task by ID
//
// In Java Spring, this would be:
//   @RestController
//   @RequestMapping("/api/tasks")
//   public class TaskController { ... }
// ============================================================

const express = require('express');
const router = express.Router();   // Creates a mini-router (like a controller)
const Task = require('../models/Task');  // Import the Task model

// ---- GET /api/tasks ----
// Returns ALL tasks from database
// Java equivalent: @GetMapping("/") public List<Task> getAll()
router.get('/', async (req, res) => {
    try {
        // Task.find() = SELECT * FROM tasks ORDER BY createdAt DESC
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);  // Send as JSON response
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ---- GET /api/tasks/:id ----
// Returns ONE task by its ID
// :id is a URL parameter (like @PathVariable in Spring)
// Java equivalent: @GetMapping("/{id}") public Task getById(@PathVariable String id)
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ---- POST /api/tasks ----
// Creates a NEW task
// req.body = the JSON sent by frontend (like @RequestBody in Spring)
// Java equivalent: @PostMapping("/") public Task create(@RequestBody Task task)
router.post('/', async (req, res) => {
    try {
        // Create new Task with title from request body
        const task = new Task({
            title: req.body.title
        });
        // Save to MongoDB (like taskRepository.save(task))
        const savedTask = await task.save();
        res.status(201).json(savedTask);  // 201 = "Created" status code
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// ---- PUT /api/tasks/:id ----
// Updates an EXISTING task
// Java equivalent: @PutMapping("/{id}") public Task update(@PathVariable String id, @RequestBody Task task)
router.put('/:id', async (req, res) => {
    try {
        // Find by ID and update with new data
        const task = await Task.findByIdAndUpdate(
            req.params.id,       // Which task to update (from URL)
            {
                title: req.body.title,
                completed: req.body.completed
            },
            { new: true, runValidators: true }  // Return updated version + validate
        );
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

// ---- DELETE /api/tasks/:id ----
// Deletes a task
// Java equivalent: @DeleteMapping("/{id}") public void delete(@PathVariable String id)
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

// Export the router (so server.js can use it)
module.exports = router;
