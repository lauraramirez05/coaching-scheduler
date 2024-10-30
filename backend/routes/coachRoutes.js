import express from 'express';
import { createCoach, getAllCoaches } from '../controllers/coachController.js';

const router = express.Router();

//Create a new coach
router.post('/', createCoach);

router.get('/', getAllCoaches);

export default router;
