import express from 'express';
import { createProblem, getTeacherDashboard,deleteProblem } from '../controllers/teacherController.js';

const router = express.Router();

router.post('/create',createProblem);
router.get('/',getTeacherDashboard);
router.post('/delete/:id',deleteProblem);

export default router;