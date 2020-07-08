const router = require('express').Router();
const jwt = require('jsonwebtoken');

const Objective = require('../../models/Objective');
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
  Objective.find().then(objectives => {
    if (!objectives) {
      return res.status(404).json({ objectiveNotFound: 'Objective not found' });
    }
    return res.json(objectives);
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
    Objective.findOne({ title: req.body.title }).then(objectives => {
      if (objectives) {
        return res.status(500).json({
          projectSameTitle: 'A objective with that title already exists',
        });
      }
      const newProject = new Objective({
        title: req.body.title,
        description: req.body.description,
        client: req.body.client,
        assignedUser: req.body.assignedUser,
        dateDue: req.body.dateDue,
      });
      newProject
        .save()
        .then(objective => res.json(objective))
        .catch(err => {
          console.log(err);
        });
    });
  },
);

module.exports = router;
