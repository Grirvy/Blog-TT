const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.redirect('/auth/login');
    }

    const userId = req.session.user_id;
    const userPosts = await Post.findAll({ where: { userId } });

    res.render('dashboard', { userPosts, loggedIn: req.session.loggedIn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to render the page for creating a new post
router.get('/create', (req, res) => {
  res.render('create-post'); // Assuming you have a view file named 'create-post.handlebars'
});

router.get('/new', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/auth/login');
  }

  res.render('new-post', { loggedIn: req.session.loggedIn });
});

router.post('/new', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.redirect('/auth/login');
    }

    const { title, content } = req.body;
    const userId = req.session.user_id;

    // Create a new blog post
    await Post.create({ title, content, userId });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/edit/:id', async (req, res) => {
    try {
      if (!req.session.loggedIn) {
        return res.redirect('/auth/login');
      }
  
      const postId = req.params.id;
      const post = await Post.findByPk(postId);
  
      if (!post || post.userId !== req.session.user_id) {
        return res.status(404).render('404');
      }
  
      res.render('edit-post', { post, loggedIn: req.session.loggedIn });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
router.post('/edit/:id', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.redirect('/auth/login');
    }

    const postId = req.params.id;
    const { title, content } = req.body;
    const userId = req.session.user_id;

    // Check if the post belongs to the logged-in user
    const post = await Post.findByPk(postId);

    if (!post || post.userId !== userId) {
      return res.status(404).render('404');
    }

    // Update the post
    await Post.update({ title, content }, { where: { id: postId } });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/delete/:id', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.redirect('/auth/login');
    }

    const postId = req.params.id;
    const userId = req.session.user_id;

    // Check if the post belongs to the logged-in user
    const post = await Post.findByPk(postId);

    if (!post || post.userId !== userId) {
      return res.status(404).render('404');
    }

    // Delete the post
    await Post.destroy({ where: { id: postId } });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.session.user_id; // Assuming you store user_id in the session

    // Validate the input (add more validation as needed)
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    // Create the new post
    const newPost = await Post.create({
      title,
      content,
      userId,
    });

    // Redirect to the dashboard or post details page
    res.redirect(`/dashboard/${newPost.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
