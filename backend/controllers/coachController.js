import Coach from '../models/Coach.js';

//Create new coach
const createCoach = async (req, res) => {
  const { name, phone } = req.body;

  try {
    const newCoach = await Coach.create({ name: name, phone: phone });

    res.status(201).json(newCoach);
  } catch (error) {
    res.status(400).json({ message: `Error creating coach`, error });
  }
};

//Get all coaches in db
const getAllCoaches = async (req, res) => {
  try {
    const coaches = await Coach.findAll();
    res.status(201).json(coaches);
  } catch (error) {
    res.status(400).json({ message: 'Error retrieving all users' });
  }
};

export { createCoach, getAllCoaches };
