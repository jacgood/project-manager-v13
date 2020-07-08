const router = require('express').Router();
const jwt = require('jsonwebtoken');

const Task = require('../../models/Task');
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
  Task.find().then(tasks => {
    if (!tasks) {
      return res.status(404).json({ taskNotFound: 'Tasks not found' });
    }
    return res.json(tasks);
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
    Task.findOne({ title: req.body.title }).then(tasks => {
      if (tasks) {
        return res.status(500).json({
          taskSameTitle: 'A task with that title already exists',
        });
      }
      const newTask = new Task({
        title: req.body.title,
        description: req.body.description,
        client: req.body.client,
        assignedUser: req.body.assignedUser,
        dateDue: req.body.dateDue,
      });
      newTask
        .save()
        .then(task => res.json(task))
        .catch(err => {
          console.log(err);
        });
    });
  },
);

module.exports = router;
