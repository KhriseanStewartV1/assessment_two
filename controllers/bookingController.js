import pool from '../config/db.js';

const PREDEFINED_USER_ID = 1;
const STATUS_SCHEDULED = 1;
const STATUS_COMPLETED = 2;
const STATUS_CANCELLED = 3;

const getAllBookings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.user_id, b.service_id, b.status_id, b.booking_date, b.booking_time, b.notes, b.created_at, b.updated_at,
       bs.name AS status_name, s.name AS service_name
       FROM bookings b
       JOIN booking_status bs ON b.status_id = bs.id
       JOIN services s ON b.service_id = s.id
       ORDER BY b.booking_date DESC, b.booking_time DESC`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT b.*, bs.name AS status_name, s.name AS service_name
       FROM bookings b
       JOIN booking_status bs ON b.status_id = bs.id
       JOIN services s ON b.service_id = s.id
       WHERE b.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const { service_id, booking_date, booking_time, notes } = req.body;

    if (service_id === undefined || service_id === null) {
      const error = new Error('service_id is required');
      error.statusCode = 400;
      return next(error);
    }
    const sid = parseInt(service_id, 10);
    if (isNaN(sid) || sid < 1) {
      const error = new Error('service_id must be a positive integer');
      error.statusCode = 400;
      return next(error);
    }
    const [serviceExists] = await pool.execute('SELECT id FROM services WHERE id = ?', [sid]);
    if (serviceExists.length === 0) {
      const error = new Error('Service not found');
      error.statusCode = 400;
      return next(error);
    }

    if (!booking_date || typeof booking_date !== 'string' || booking_date.trim() === '') {
      const error = new Error('booking_date is required');
      error.statusCode = 400;
      return next(error);
    }
    if (!booking_time || typeof booking_time !== 'string' || booking_time.trim() === '') {
      const error = new Error('booking_time is required');
      error.statusCode = 400;
      return next(error);
    }

    const [result] = await pool.execute(
      'INSERT INTO bookings (user_id, service_id, status_id, booking_date, booking_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [PREDEFINED_USER_ID, sid, STATUS_SCHEDULED, booking_date.trim(), booking_time.trim(), notes != null ? notes.trim() : null]
    );
    const [rows] = await pool.query(
      `SELECT b.*, bs.name AS status_name FROM bookings b JOIN booking_status bs ON b.status_id = bs.id WHERE b.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status_id } = req.body;

    if (status_id === undefined || status_id === null) {
      const error = new Error('status_id is required');
      error.statusCode = 400;
      return next(error);
    }
    const statusId = parseInt(status_id, 10);
    if (isNaN(statusId) || statusId < 1 || statusId > 3) {
      const error = new Error('status_id must be 1 (Scheduled), 2 (Completed), or 3 (Cancelled)');
      error.statusCode = 400;
      return next(error);
    }

    const [existing] = await pool.execute('SELECT id FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      return next(error);
    }

    await pool.execute('UPDATE bookings SET status_id = ? WHERE id = ?', [statusId, id]);
    const [rows] = await pool.query(
      `SELECT b.*, bs.name AS status_name FROM bookings b JOIN booking_status bs ON b.status_id = bs.id WHERE b.id = ?`,
      [id]
    );
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.execute('SELECT id, status_id FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      return next(error);
    }
    if (existing[0].status_id === STATUS_CANCELLED) {
      const error = new Error('Booking is already cancelled');
      error.statusCode = 400;
      return next(error);
    }

    await pool.execute('UPDATE bookings SET status_id = ? WHERE id = ?', [STATUS_CANCELLED, id]);
    const [rows] = await pool.query(
      `SELECT b.*, bs.name AS status_name FROM bookings b JOIN booking_status bs ON b.status_id = bs.id WHERE b.id = ?`,
      [id]
    );
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
};
