import express from 'express';
import {
  addTimeSlot,
  availableMeetingForStudents,
  getAllMeetingsForCoach,
  getPastMeetingsForCoach,
  validateBookingData,
  submitReview,
} from '../controllers/timeSlotController.js';

const router = express.Router();

//create new timeslot
router.post('/', addTimeSlot);

router.get('/', (req, res) => {
  console.log('hitting time slot router');
  res.status(201).json('hitting the GET end point');
});

router.get('/:coachId/:timezone/allmeetings', getAllMeetingsForCoach);

router.get(`/:coachId/:timezone/pastmeetings`, getPastMeetingsForCoach);

router.get('/available', availableMeetingForStudents);

router.patch('/book', validateBookingData);

router.patch('/review', submitReview);

export default router;
