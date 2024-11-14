const express = require('express');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Create a new post
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('posts').insertOne(req.body);
    res.status(201).json({ success: true, data: result.ops[0] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const posts = await db.collection('posts').find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a post by ID
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const updatedPost = await db.collection('posts').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updatedPost.value) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: updatedPost.value });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('posts').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
