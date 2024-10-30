import express from 'express';
import {
  createStudent,
  getAllStudents,
} from '../controllers/studentController.js';

const router = express.Router();

// Create a new student
router.post('/', createStudent);

router.get('/', getAllStudents);

export default router;
