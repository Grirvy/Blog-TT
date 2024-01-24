const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const handlebars = require('express-handlebars');
const sequelize = require('./config/CONN');
const homeController = require('./controllers/homeController');
const dashboardController = require('./controllers/dashboardController');
const authController = require('./controllers/authController');
const exphbs = require('express-handlebars');
const handlebarsHelpers = require('./utils/helpers');

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session setup
const sess = {
  secret: process.env.SECRETPW,
  cookie: {
    maxAge: 900000,
    httpOnly: true,
    secure: false,
    sameSite: 'strict',},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.use(session(sess));

// Handlebars setup
app.engine('handlebars', exphbs({ helpers: handlebarsHelpers }));
app.set('view engine', 'handlebars');

app.use((req, res, next) => {
    res.locals.formatDate = handlebarsHelpers.formatDate;
    res.locals.username = req.session.username; // Make username available in views
    next();
});

app.use((req, res, next) => {
    if (req.session.loggedIn) {
      req.session.lastActive = new Date().getTime();
    }
    next();
  });
  
// Middleware for checking user inactivity and redirecting to login if needed
app.use((req, res, next) => {
  const maxInactiveTime = 15 * 60 * 1000; // 15 minutes

  if (req.session.loggedIn && req.session.lastActive) {
    const elapsedTime = new Date().getTime() - req.session.lastActive;

    if (elapsedTime > maxInactiveTime) {
      req.session.destroy(() => {
        res.redirect('/auth/login');
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

// Routes
app.use('/', homeController);
app.use('/dashboard', dashboardController);
app.use('/auth', authController);

app.post('/comment/:postId', async (req, res) => {
    if (!req.session.loggedIn) {
      return res.redirect('/auth/login');
    }
  
    try {
      const { comment } = req.body;
      const postId = req.params.postId;
      const userId = req.session.user_id;
  
      // Create a new comment
      const newComment = await Comment.create({ comment, userId, postId });
  
      // Redirect to the post details page after adding the comment
      res.redirect(`/post/${postId}`);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Sync sequelize models and start the server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});