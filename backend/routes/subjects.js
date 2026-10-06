const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find().populate('facultyId');
    res.json(subjects);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    const subject = await newSubject.save();
    res.json(subject);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;