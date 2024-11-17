const express = require('express');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const upload = require('../config/multerConfig');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const VALID_TAGS = [
    'Adventure', 'Trail Review', 'Scenic View', 'Trail Tips', 
    'Gear Advice', 'Planning Help', 'Weather Concerns',
    'Trail Running', 'Question', 'Opinion', 'Discussion', 'Other'
];

// Validate tags
const validateTags = (tags) => {
    if (!Array.isArray(tags)) return false;
    return tags.every((tag) => VALID_TAGS.includes(tag));
};

// Create a new post
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, content, imageUrl, tags, userId, secretKey } = req.body;

        // Parse tags if they are sent as a JSON string
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }
        if (!secretKey || secretKey.trim() === '') {
            return res.status(400).json({ success: false, error: 'Secret key is required' });
        }
        if (parsedTags && !validateTags(parsedTags)) {
            return res.status(400).json({ success: false, error: 'Invalid tags provided' });
        }

        // Prepare the new post object
        const newPost = {
            title: title.trim(),
            content: content ? content.trim() : '',
            imageUrl: imageUrl || null, // External image URL
            localImagePath: req.file ? `/uploads/${req.file.filename}` : null, // Local image path
            createdAt: new Date(),
            upvotes: 0,
            comments: [],
            tags: parsedTags || [],
            userId: userId.trim(),
            secretKey: secretKey.trim(),
            repostId: uuidv4()
        };

        const db = getDB();
        const result = await db.collection('posts').insertOne(newPost);
        
        // Debugging statement to check the structure of result
        console.log('Insert result:', result);

        if (!result.acknowledged) {
            return res.status(500).json({ success: false, error: 'Failed to create post' });
        }

        // Fetch the inserted document using the insertedId
        const insertedPost = await db.collection('posts').findOne({ _id: result.insertedId });

        res.status(201).json({ success: true, data: insertedPost });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

        // Validate ObjectId
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid post ID' });
        }

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
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, content, imageUrl, tags, userId, secretKey } = req.body;

        // Parse tags if they are sent as a JSON string
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

        const db = getDB();

        // Validate ObjectId
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid post ID' });
        }

        const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        // Validate secretKey
        if (post.secretKey !== secretKey.trim()) {
            return res.status(403).json({ success: false, error: 'Incorrect secret key' });
        }

        // Prepare the updated post object
        const updatedPost = {
            title: title ? title.trim() : post.title,
            content: content ? content.trim() : post.content,
            imageUrl: imageUrl || post.imageUrl,
            localImagePath: req.file ? `/uploads/${req.file.filename}` : post.localImagePath, // Update local image path if new file is uploaded
            tags: parsedTags || post.tags,
            userId: userId ? userId.trim() : post.userId,
            secretKey: secretKey.trim(),
            updatedAt: new Date()
        };

        const result = await db.collection('posts').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updatedPost },
            { returnDocument: 'after' }
        );

        res.json({ success: true, data: result.value });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a post
router.delete('/:id', async (req, res) => {
    try {
        const { secretKey } = req.body;
        const db = getDB();

        // Validate ObjectId
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid post ID' });
        }

        const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        // Validate secretKey
        if (post.secretKey !== secretKey.trim()) {
            return res.status(403).json({ success: false, error: 'Incorrect secret key' });
        }

        // Delete post
        await db.collection('posts').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upvote a post
router.post('/:id/upvote', async (req, res) => {
    try {
        const db = getDB();

        // Validate ObjectId
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid post ID' });
        }

        const result = await db.collection('posts').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $inc: { upvotes: 1 } },
            { returnDocument: 'after' }
        );

        console.log('Upvote result:', result);

        if (!result.value) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        res.json({ success: true, data: result.value });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add a comment to a post
router.post('/:id/comments', async (req, res) => {
    try {
      const { userId, comment } = req.body;
      const db = getDB();
  
      // Validate ObjectId
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, error: 'Invalid post ID' });
      }
  
      const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
  
      const newComment = {
        userId,
        comment,
        createdAt: new Date(),
      };
  
      const result = await db.collection('posts').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $push: { comments: newComment } }
      );
  
      res.status(201).json({ success: true, data: newComment });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  module.exports = router;
