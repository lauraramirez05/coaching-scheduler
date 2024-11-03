import express from 'express';
import {
  addTimeSlot,
  availableMeetingForStudents,
  getUpcomingMeetingsForCoach,
  validateBookingData,
} from '../controllers/timeSlotController.js';

const router = express.Router();

//create new timeslot
router.post('/', addTimeSlot);

router.get('/', (req, res) => {
  console.log('hitting time slot router');
  res.status(201).json('hitting the GET end point');
});

router.get('/:coachId/:timezone/upcoming', getUpcomingMeetingsForCoach);

router.get('/available', availableMeetingForStudents);

router.patch('/book', validateBookingData);

export default router;
