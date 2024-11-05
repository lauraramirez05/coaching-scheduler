import Student from '../models/Student.js';

//Create new student
const createStudent = async (req, res, next) => {
  const { name, phone } = req.body;

  try {
    const newStudent = await Student.create({ name, phone });

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating student', error });
  }

  // next();
};

//Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(201).json(students);
  } catch (error) {
    res.status(400).json({ message: 'Error trying to retrieve all students' });
  }
};

export { createStudent, getAllStudents };
