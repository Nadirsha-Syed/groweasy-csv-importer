import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import importRouter from './routes/import.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); 

app.use('/api', importRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'active', time: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Processing Engine running on http://localhost:${PORT}`);
});