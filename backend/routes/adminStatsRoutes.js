import express from "express";
import { getAdminStats } from "../controllers/adminStatsController.js";


const router = express.Router();

// Protegido para role=admin
router.get('/stats', getAdminStats);



export default router;
