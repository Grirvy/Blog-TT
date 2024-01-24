const fs = require('fs');
const path = require('path');
const sequelize = require('../config/CONN');

const seedDatabase = async () => {
    try {
      // Read seed data from JSON files
      const userData = JSON.parse(fs.readFileSync(path.join(__dirname, 'userSeedData.json'), 'utf-8'));
      const postData = JSON.parse(fs.readFileSync(path.join(__dirname, 'postSeedData.json'), 'utf-8'));
      const commentData = JSON.parse(fs.readFileSync(path.join(__dirname, 'commentSeedData.json'), 'utf-8'));
  
      // Define your Sequelize models (assuming User, Post, Comment models are defined)
      const User = require('../models/User');
      const Post = require('../models/Post');
      const Comment = require('../models/Comment');
  
      // Sync models with the database
      await sequelize.sync({ force: true });
  
      // Seed Users
      await User.bulkCreate(userData);
  
      // Seed Posts
      await Post.bulkCreate(postData);
  
      // Seed Comments
      await Comment.bulkCreate(commentData);
  
      console.log('Database seeded successfully.');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
};
  
// Call the seedDatabase function on startup
seedDatabase();