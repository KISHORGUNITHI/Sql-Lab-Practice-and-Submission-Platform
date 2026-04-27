import express from 'express';
import { createProblem, getTeacherDashboard,deleteProblem,showCreateForm } from '../controllers/teacherController.js';

const router = express.Router();

router.get('/createform',showCreateForm);
router.post('/create',createProblem);
router.get('/',getTeacherDashboard);
router.post('/delete/:id',deleteProblem);

export default router;