import pool from '../config/db.js';

const getAllServices = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, price, estimated_duration_minutes, is_available, created_at, updated_at FROM services ORDER BY id'
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM services WHERE id = ?', [id]);
    if (rows.length === 0) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const createService = async (req, res, next) => {
  try {
    const { name, description, price, estimated_duration_minutes, is_available } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      const error = new Error('Name is required and must be a non-empty string');
      error.statusCode = 400;
      return next(error);
    }
    if (description !== undefined && typeof description !== 'string') {
      const error = new Error('Description must be a string');
      error.statusCode = 400;
      return next(error);
    }
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (price === undefined || price === null || (typeof priceNum !== 'number') || isNaN(priceNum) || priceNum < 0) {
      const error = new Error('Price is required and must be a non-negative number');
      error.statusCode = 400;
      return next(error);
    }
    const durationNum = typeof estimated_duration_minutes === 'string' ? parseInt(estimated_duration_minutes, 10) : estimated_duration_minutes;
    if (
      estimated_duration_minutes === undefined ||
      estimated_duration_minutes === null ||
      (typeof durationNum !== 'number') ||
      isNaN(durationNum) ||
      durationNum <= 0
    ) {
      const error = new Error('estimated_duration_minutes is required and must be a positive number');
      error.statusCode = 400;
      return next(error);
    }
    if (is_available !== undefined && typeof is_available !== 'boolean') {
      const error = new Error('is_available must be a boolean');
      error.statusCode = 400;
      return next(error);
    }

    const [result] = await pool.execute(
      'INSERT INTO services (name, description, price, estimated_duration_minutes, is_available) VALUES (?, ?, ?, ?, ?)',
      [
        name.trim(),
        description != null ? description.trim() : null,
        priceNum,
        durationNum,
        is_available !== false ? 1 : 0,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, estimated_duration_minutes, is_available } = req.body;

    const [existing] = await pool.execute('SELECT id FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      return next(error);
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Name must be a non-empty string');
        error.statusCode = 400;
        return next(error);
      }
    }
    if (description !== undefined && typeof description !== 'string') {
      const error = new Error('Description must be a string');
      error.statusCode = 400;
      return next(error);
    }
    if (price !== undefined) {
      const p = typeof price === 'string' ? parseFloat(price) : price;
      if (typeof p !== 'number' || isNaN(p) || p < 0) {
        const error = new Error('Price must be a non-negative number');
        error.statusCode = 400;
        return next(error);
      }
    }
    if (estimated_duration_minutes !== undefined) {
      const d = typeof estimated_duration_minutes === 'string' ? parseInt(estimated_duration_minutes, 10) : estimated_duration_minutes;
      if (typeof d !== 'number' || isNaN(d) || d <= 0) {
        const error = new Error('estimated_duration_minutes must be a positive number');
        error.statusCode = 400;
        return next(error);
      }
    }
    if (is_available !== undefined && typeof is_available !== 'boolean') {
      const error = new Error('is_available must be a boolean');
      error.statusCode = 400;
      return next(error);
    }

    const [current] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    const row = current[0];
    const newName = name !== undefined ? name.trim() : row.name;
    const newDesc = description !== undefined ? description.trim() : row.description;
    const newPrice = price !== undefined ? (typeof price === 'string' ? parseFloat(price) : price) : row.price;
    const newDuration =
      estimated_duration_minutes !== undefined
        ? (typeof estimated_duration_minutes === 'string' ? parseInt(estimated_duration_minutes, 10) : estimated_duration_minutes)
        : row.estimated_duration_minutes;
    const newAvailable = is_available !== undefined ? (is_available ? 1 : 0) : row.is_available;

    await pool.execute(
      'UPDATE services SET name = ?, description = ?, price = ?, estimated_duration_minutes = ?, is_available = ? WHERE id = ?',
      [newName, newDesc, newPrice, newDuration, newAvailable, id]
    );
    const [updated] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    res.status(200).json({ success: true, data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM services WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: { id: parseInt(id, 10), message: 'Service deleted' } });
  } catch (err) {
    next(err);
  }
};

export {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
