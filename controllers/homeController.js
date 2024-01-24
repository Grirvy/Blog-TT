const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { formatDate } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.render('index', { posts, loggedIn: req.session.loggedIn, formatDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/post/:id', async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Post.findByPk(postId);
      // Fetch comments associated with the post
      const comments = await Comment.findAll({ where: { postId } });
  
      res.render('post', { post, comments, loggedIn: req.session.loggedIn, formatDate });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
