const express = require('express');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
