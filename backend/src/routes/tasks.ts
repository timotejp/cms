import express from 'express';
import { pool } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { status, client_id, priority, page = '1', limit = '50' } = req.query;
    let query = `
      SELECT t.*, 
             c.name as client_name, c.phone as client_phone, c.email as client_email,
             d.serial_number as device_serial,
             dt.name as device_type_name, dt.name_sl as device_type_name_sl
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN devices d ON t.device_id = d.id
      LEFT JOIN device_types dt ON d.device_type_id = dt.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (client_id) {
      query += ` AND t.client_id = $${paramCount}`;
      params.push(client_id);
      paramCount++;
    }

    if (priority) {
      query += ` AND t.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    query += ` ORDER BY t.scheduled_date DESC, t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), offset);

    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM tasks WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 1;
    
    if (status) {
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }
    if (client_id) {
      countQuery += ` AND client_id = $${countParamCount}`;
      countParams.push(client_id);
      countParamCount++;
    }
    if (priority) {
      countQuery += ` AND priority = $${countParamCount}`;
      countParams.push(priority);
    }
    
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
             c.name as client_name, c.phone as client_phone, c.email as client_email,
             d.serial_number as device_serial,
             dt.name as device_type_name, dt.name_sl as device_type_name_sl
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN devices d ON t.device_id = d.id
      LEFT JOIN device_types dt ON d.device_type_id = dt.id
      WHERE t.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const {
      client_id, device_id, title, description, status, priority,
      scheduled_date, estimated_duration, technician_notes, materials_used, cost
    } = req.body;
    
    if (!client_id || !title) {
      return res.status(400).json({ error: 'Client ID and title are required' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (
        client_id, device_id, title, description, status, priority,
        scheduled_date, estimated_duration, technician_notes, materials_used, cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        client_id, device_id, title, description, status || 'pending',
        priority || 'medium', scheduled_date, estimated_duration,
        technician_notes, materials_used, cost
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const {
      client_id, device_id, title, description, status, priority,
      scheduled_date, completed_date, estimated_duration, actual_duration,
      technician_notes, materials_used, cost
    } = req.body;
    
    const result = await pool.query(
      `UPDATE tasks 
       SET client_id = $1, device_id = $2, title = $3, description = $4,
           status = $5, priority = $6, scheduled_date = $7, completed_date = $8,
           estimated_duration = $9, actual_duration = $10,
           technician_notes = $11, materials_used = $12, cost = $13,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        client_id, device_id, title, description, status, priority,
        scheduled_date, completed_date, estimated_duration, actual_duration,
        technician_notes, materials_used, cost, req.params.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;

