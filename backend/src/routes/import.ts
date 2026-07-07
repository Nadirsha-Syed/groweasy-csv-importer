import { Router } from 'express';
import { handleCSVImportData } from '../controllers/importController.js';

const router = Router();

router.post('/import', handleCSVImportData);

export default router;