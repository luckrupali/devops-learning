// ============================================================
// models/Task.js — DATABASE SCHEMA (like @Entity class in Java)
// ============================================================
// This file defines WHAT a "Task" looks like in the database.
//
// In Java terms:
//   @Entity
//   @Table(name = "tasks")
//   public class Task {
//       @Id private String id;
//       @Column private String title;
//       @Column private boolean completed;
//   }
//
// MongoDB stores data as JSON-like documents (not rows in tables).
// A document looks like:
//   {
//     "_id": "665abc123...",
//     "title": "Learn Docker",
//     "completed": false,
//     "createdAt": "2026-06-01T10:00:00Z"
//   }
// ============================================================

const mongoose = require('mongoose');

// Define the schema (shape of the data)
const taskSchema = new mongoose.Schema({
    // "title" field: must be a String, cannot be empty
    title: {
        type: String,
        required: [true, 'Task title is required'],  // Validation
        trim: true                                     // Remove extra spaces
    },
    // "completed" field: true/false, defaults to false
    completed: {
        type: Boolean,
        default: false
    },
    // "createdAt" field: auto-set to current time when created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export the model
// mongoose.model('Task', taskSchema) does TWO things:
// 1. Creates a "tasks" collection in MongoDB (lowercase + plural of 'Task')
// 2. Returns an object with methods: find(), create(), findByIdAndUpdate(), etc.
module.exports = mongoose.model('Task', taskSchema);
