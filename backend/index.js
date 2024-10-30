import express from 'express';
import studentRoutes from './routes/studentRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Test DB connection

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/students', studentRoutes);

app.use('/api/coaches', coachRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
