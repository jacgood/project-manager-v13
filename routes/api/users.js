const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
    body('email', 'Add a valid email').isEmail(),
    body(
      'password',
      'Enter a password with eight or more characters',
    ).isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // Check validation
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    await User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        return res.status(400).json({ email: 'Email already exists' });
      }
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
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
  async (req, res) => {
    // Form validation
    const errors = validationResult(req);
    // Check validation
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const { email, password } = req.body;
    // Find user by email
    User.findOne({ email }).then((user) => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: 'Email not found' });
      }
      // Check password
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res
            .status(400)
            .json({ passwordincorrect: 'Password incorrect' });
        }
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };
        // Sign token
        jwt.sign(
          payload,
          process.env.JWT_SECRET || 'k;jshdifjhasdlkjfhsdkjfh',
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token,
            });
          },
        );
      });
    });
  },
);

// @route GET api/users/{%id}
// @desc get user by id
// @access Public
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // Find user by email
  User.findById(id).then((user) => {
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
  User.find().then((users) => {
    // Check if user exists
    if (!users) {
      return res.status(404).json({ userNotFound: 'Users not found' });
    }
    return res.json(users);
  });
});

module.exports = router;
