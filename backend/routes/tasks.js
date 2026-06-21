// routes/tasks.js
// All RESTful routes for the /api/tasks resource live here.
// Each route is wrapped in try/catch so a DB error returns JSON, not a crash.

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/tasks
// Retrieve every saved task, newest first.
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    console.error('GET /api/tasks error:', err.message);
    res.status(500).json({ success: false, message: 'Server error while fetching tasks' });
  }
});

// POST /api/tasks
// Validate and insert a new task.
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    // Basic manual validation in addition to the Mongoose schema rules
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error('POST /api/tasks error:', err.message);
    // Mongoose validation errors come back as err.name === 'ValidationError'
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error while creating task' });
  }
});

// PATCH /api/tasks/:id
// Toggle / update an existing task (used for marking complete).
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error('PATCH /api/tasks/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Server error while updating task' });
  }
});

// DELETE /api/tasks/:id
// Remove a single task by its Mongo _id.
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('DELETE /api/tasks/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Server error while deleting task' });
  }
});

module.exports = router;
