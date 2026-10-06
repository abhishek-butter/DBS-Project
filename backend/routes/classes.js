const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find().populate('subjectId facultyId');
    res.json(classes);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    const newClass = new Class(req.body);
    const savedClass = await newClass.save();
    res.json(savedClass);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;