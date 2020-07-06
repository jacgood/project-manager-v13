const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ things: 'stuff' });
});

module.exports = router;
