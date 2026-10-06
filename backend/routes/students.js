const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    const student = await newStudent.save();
    res.json(student);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;