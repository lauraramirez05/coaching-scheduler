import Coach from '../models/Coach.js';

//Create new coach
const createCoach = async (req, res) => {
  console.log(`Create coach controller`);
  const { name, phone } = req.body;

  console.log('BODY', [name, phone]);

  try {
    const newCoach = await Coach.create({ name: name, phone: phone });
    console.log(newCoach);
    res.status(201).json(newCoach);
  } catch (error) {
    res.status(400).json({ message: `Error creating coach`, error });
  }
};

//Get all coaches in db
const getAllCoaches = async (req, res) => {
  console.log(`hitting getAllCoaches middleware`);
  try {
    console.log(`In the try block`);
    const coaches = await Coach.findAll();
    res.status(201).json(coaches);
  } catch (error) {
    console.log('hey');
    res.status(400).json({ message: 'Error retrieving all users' });
  }
};

export { createCoach, getAllCoaches };
