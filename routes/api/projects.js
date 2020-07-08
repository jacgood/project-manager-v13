const router = require('express').Router();
const jwt = require('jsonwebtoken');

const { body, validationResult } = require('express-validator');

const Project = require('../../models/Project');

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
          console.log(err); // eslint-disable-line
        });
    });
  },
);

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { objectiveId, taskId } = req.query;
  const { objective, task } = req.body;

  Project.findByIdAndUpdate(id, req.body, (err, project) => {
    if (err) {
      return res.status(500).json(err);
    }
    const obj = project.objectives.id(objectiveId);

    if (!objectiveId && !taskId) {
      if (objective) {
        // add an objective
        project.objectives.push(objective);
      }
    } else if (objectiveId && !taskId) {
      if (objective) {
        // update the objective
        obj.set(objective);
      } else {
        // add a task
        obj.tasks.push(task);
      }
    } else if (objectiveId && taskId) {
      // update the task
      const tsk = obj.tasks.id(taskId);
      tsk.set(task);
    }

    project
      .save()
      .then(project => {
        res.json(project);
      })
      .catch(err => {
        console.log(err); // eslint-disable-line
      });
  });
});

// router.put('/:id', (req, res) => {
//   const { id } = req.params;
//   const { objectiveId, taskId } = req.query;
//   const { project, objective, task } = req.body;

//   Project.findById(id, (err, proj) => {
//     if (err) {
//       return res.status(500).json(err);
//     }

//     const obj = proj.objectives.id(objectiveId);

//     if (!objectiveId && !taskId) {
//       if (!objective) {
//         // update the project
//         proj = project;
//       } else {
//         // add an objective
//         proj.objectives.push(objective);
//       }
//     } else if (objectiveId && !taskId) {
//       if (objective) {
//         // update the objective
//         obj.set(objective);
//       } else {
//         // add a task
//         obj.tasks.push(task);
//       }
//     } else if (objectiveId && taskId) {
//       // update the task
//       const tsk = obj.tasks.id(taskId);
//       tsk.set(task);
//     }

//     proj
//       .save()
//       .then(proj => {
//         res.json(project);
//       })
//       .catch(err => {
//         console.log(err); // eslint-disable-line
//       });
//   });
// });

// router.delete('/:id', (req, res) => {
//   const { id } = req.params;
//   const { objectiveId, taskId } = req.query;
//   const { objective, task } = req.body;

//   Project.findById(id, (err, project) => {
//     if (err) {
//       return res.status(500).json(err);
//     }

//     const obj = project.objectives.id(objectiveId);

//     if (!objectiveId && !taskId) {
//       // console.log('creating objective ...');
//       project.objectives.push(objective);
//     } else if (objectiveId && !taskId) {
//       if (objective) {
//         // console.log('updating objective ...');
//         obj.set(objective);
//       } else {
//         // console.log('creating task ...');
//         obj.tasks.push(task);
//       }
//     } else if (objectiveId && taskId) {
//       // console.log('updating task ...');
//       const tsk = obj.tasks.id(taskId);
//       tsk.set(task);
//     }

//     project
//       .save()
//       .then(project => {
//         res.json(project);
//       })
//       .catch(err => {
//         console.log(err); // eslint-disable-line
//       });
//   });
// });

module.exports = router;
