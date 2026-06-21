// models/Task.js
// Defines the structure ("schema") of a single Task document stored in MongoDB.
// Field types are chosen to match the JSON object shape sent from the frontend.

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,        // task name, e.g. "Submit Assignment 3"
    required: [true, 'Title is required'],
    trim: true,
    minlength: 1,
    maxlength: 120
  },
  description: {
    type: String,        // optional extra detail about the task
    trim: true,
    default: ''
  },
  priority: {
    type: String,        // one of a fixed set of values
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  completed: {
    type: Boolean,       // whether the task is done
    default: false
  },
  dueDate: {
    type: Date,           // optional deadline
    default: null
  },
  createdAt: {
    type: Date,           // when the record was inserted
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);
