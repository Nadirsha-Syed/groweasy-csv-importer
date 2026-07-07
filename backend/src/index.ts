import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import importRouter from './routes/import.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); 

app.use('/api', importRouter);

app.get('/', (req, res) => {
  res.status(200).send('🚀 AI CSV Importer API Service is Healthy and Running!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', time: new Date() });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Processing Engine is running dynamically on port ${PORT}`);
});