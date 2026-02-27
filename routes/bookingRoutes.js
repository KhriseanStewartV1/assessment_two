import express from 'express';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id/cancel', bookingController.cancelBooking);
router.put('/:id', bookingController.updateBookingStatus);

export default router;
