const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const faculty = await Faculty.find();
    res.json(faculty);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    const newFaculty = new Faculty(req.body);
    const faculty = await newFaculty.save();
    res.json(faculty);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;