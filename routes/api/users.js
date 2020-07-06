const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.JWT_ACCESSTOKEN || 'r;oaisdhf0ishdf;ghzx';
const refreshTokenSecret = process.env.JWT_REFRESHTOKEN || 'r;kjdshfkj;ghzx';
let refreshTokens = [];
// Load input validation
const { body, validationResult } = require('express-validator');
// Load User model
const User = require('../../models/User');

// @route POST api/users/register
// @desc Register user
// @access Public
router.post(
  '/register',
  [
    body('firstName', 'First name connot be empty').not().isEmpty(),
    body('lastName', 'Last name connot be empty').not().isEmpty(),
    body('role', 'User must have a role').not().isEmpty(),
    body('email', 'Add a valid email').isEmail(),
    body(
      'password',
      'Enter a password with eight or more characters',
    ).isLength({ min: 8 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    // Check validation
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(400).json({ email: 'Email already exists' });
      }
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    });
  },
);

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post(
  '/login',
  [
    body('email', 'Email field is reqiured').not().isEmpty(),
    body('password', 'Password field is required').not().isEmpty(),
  ],
  (req, res) => {
    // Form validation
    const errors = validationResult(req);
    // Check validation
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const { email, password } = req.body;
    // Find user by email
    User.findOne({ email })
      .then(user => {
        // Check if user exists
        if (!user) {
          return res.status(404).json({ emailnotfound: 'Email not found' });
        }
        // Check password
        bcrypt
          .compare(password, user.password)
          .then(isMatch => {
            if (!isMatch) {
              return res
                .status(400)
                .json({ passwordincorrect: 'Password incorrect' });
            }

            const accessToken = jwt.sign(
              { email: user.email, role: user.role },
              accessTokenSecret,
              { expiresIn: '20m' },
            );
            const refreshToken = jwt.sign(
              { email: user.email, role: user.role },
              refreshTokenSecret,
            );

            refreshTokens.push(refreshToken);

            res.json({
              success: true,
              token: accessToken,
              refresh: refreshToken,
            });
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });
  },
);

router.post('/token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }

  jwt.verify(token, refreshTokenSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = jwt.sign(
      { email: user.email, role: user.role },
      accessTokenSecret,
      { expiresIn: '12h' },
    );

    res.json({ accessToken });
  });
});

router.post('/logout', (req, res) => {
  const { token } = req.body; // eslint-disable-line
  refreshTokens = refreshTokens.filter(t => t.token !== token); // eslint-disable-line

  res.send('Logout successfull');
});

// @route GET api/users/{%id}
// @desc get user by id
// @access Public
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // Find user by email
  User.findById(id).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ userNotFound: 'User not found' });
    }
    return res.json(user);
  });
});

// @route GET api/users/
// @desc GET all users
// @access Public
router.get('/', (req, res) => {
  // Find all users
  User.find().then(users => {
    // Check if user exists
    if (!users) {
      return res.status(404).json({ userNotFound: 'Users not found' });
    }
    return res.json(users);
  });
});

module.exports = router;
