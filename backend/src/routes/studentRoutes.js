import express from "express"
import {showProblem,studentDashboard,runQuery} from "../controllers/studentController.js"

const router=express.Router()

router.get('/',studentDashboard);
router.get('/problem/:id',showProblem)
router.post('/problem/:id/run',runQuery)

export default router;
