import express from 'express';
import {
  addTimeSlot,
  availableMeetingForStudents,
  getAllMeetingsForCoach,
  getPastMeetingsForCoach,
  validateBookingData,
  submitReview,
  getBookedMeetingsForStudent,
} from '../controllers/timeSlotController.js';

const router = express.Router();

//create new timeslot
router.post('/', addTimeSlot);

router.get('/', (req, res) => {
  res.status(201).json('hitting the GET end point');
});

router.get('/:coachId/:timezone/allmeetings', getAllMeetingsForCoach);

router.get(`/:coachId/:timezone/pastmeetings`, getPastMeetingsForCoach);

router.get('/available', availableMeetingForStudents);

router.get('/:userId/:timezone/upcoming', getBookedMeetingsForStudent);

router.patch('/book', validateBookingData);

router.patch('/review', submitReview);

export default router;
