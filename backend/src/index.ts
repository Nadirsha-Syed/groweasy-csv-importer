import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import importRouter from './routes/import'; 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); 

app.use('/api', importRouter);

app.get('/', (req, res) => {
  res.send('🚀 AI CSV Importer API Service is Live!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'active', time: new Date() });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Processing Engine is running dynamically on port ${PORT}`);
});