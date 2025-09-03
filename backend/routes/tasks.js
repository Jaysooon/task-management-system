const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const newComment = {
      text: text.trim(),
      authorId: req.user.id,
      authorName: req.user.name,
      // timestamp will be set by schema default
    };

    task.comments.push(newComment);
    await task.save();

    // Return the updated task with the new comment
    res.status(201).json(task);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).send('Task not found');
  res.json(task);
});

router.patch('/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).send('Task not found');
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).send('Task not found');
  res.status(204).send();
});

module.exports = router;