import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import { getNotifications , deleteNotifications , deleteOneNotification } from '../controllers/notification.controller.js'

const router = express.Router();

router.get("/" , protectedRoute , getNotifications)
router.delete("/" , protectedRoute , deleteNotifications)
router.delete("/:id" , protectedRoute , deleteOneNotification)

export default router;