const router = require('express').Router();
const jwt = require('jsonwebtoken');

const Project = require('../../models/Project');
const { body, validationResult } = require('express-validator');
const { Schema } = require('mongoose');
const e = require('express');

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
    Project.findOne({ title: req.body.title }).then(projects => {
      if (projects) {
        return res.status(500).json({
          projectSameTitle: 'A project with that title already exists',
        });
      }
      const newProject = new Project({
        title: req.body.title,
        description: req.body.description,
        client: req.body.client,
        assignedUser: req.body.assignedUser,
        dateDue: req.body.dateDue,
      });
      newProject
        .save()
        .then(project => res.json(project))
        .catch(err => {
          console.log(err);
        });
    });
  },
);

router.put('/:id', (req, res) => {
  const projectId = req.params.id;
  Project.findById(projectId, (err, project) => {
    if (err) {
      return res.status(500).json(err);
    }
    const objId = req.query.objectiveId;
    const objective = project.objectives.id(objId);

    if (!objective) {
      project.objectives.push(req.body);
    } else {
      objective.set(req.body);
    }

    project
      .save()
      .then(project => {
        res.json(project);
      })
      .catch(err => {
        console.log(err);
      });
  });
});

module.exports = router;
