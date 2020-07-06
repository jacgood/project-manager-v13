const router = require('express').Router();
const jwt = require('jsonwebtoken');

const Project = require('../../models/Project');
const { body, validationResult } = require('express-validator');

router.use((req, res, next) => {
  const token = req.headers['access-token'];

  if (token) {
    jwt.verify(token, process.env.JWT_ACCESSTOKEN, (err, decoded) => {
      if (err) {
        return res.json({ message: 'invalid token' });
      }
      req.decoded = decoded;
      next();
    });
  } else {
    res.send({
      message: 'No token provided',
    });
  }
});

router.get('/', (req, res) => {
  Project.find().then(projects => {
    if (!projects) {
      return res.status(404).json({ projectNotFound: 'Projects not found' });
    }
    return res.json(projects);
  });
});

router.post(
  '/',
  [body('title', 'Title is required').not().isEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
  },
);

module.exports = router;
