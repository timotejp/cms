import express from 'express';
import { pool } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Get all devices
router.get('/', async (req, res) => {
  try {
    const { client_id } = req.query;
    let query = `
      SELECT d.*, 
             dt.name as device_type_name, dt.name_sl as device_type_name_sl, dt.icon as device_type_icon,
             b.name as brand_name,
             m.name as model_name,
             c.name as client_name
      FROM devices d
      LEFT JOIN device_types dt ON d.device_type_id = dt.id
      LEFT JOIN brands b ON d.brand_id = b.id
      LEFT JOIN models m ON d.model_id = m.id
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (client_id) {
      query += ` AND d.client_id = $${paramCount}`;
      params.push(client_id);
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get devices by client
router.get('/client/:clientId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, 
             dt.name as device_type_name, dt.name_sl as device_type_name_sl, dt.icon as device_type_icon,
             b.name as brand_name,
             m.name as model_name
      FROM devices d
      LEFT JOIN device_types dt ON d.device_type_id = dt.id
      LEFT JOIN brands b ON d.brand_id = b.id
      LEFT JOIN models m ON d.model_id = m.id
      WHERE d.client_id = $1
      ORDER BY d.created_at DESC
    `, [req.params.clientId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get device types
router.get('/types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM device_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch device types:', error);
    res.status(500).json({ error: 'Failed to fetch device types' });
  }
});

// Get brands
router.get('/brands', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM brands ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get models by brand
router.get('/brands/:brandId/models', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM models WHERE brand_id = $1 ORDER BY name',
      [req.params.brandId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Create device
router.post('/', async (req, res) => {
  try {
    const {
      client_id, device_type_id, brand_id, model_id,
      custom_brand, custom_model, serial_number,
      installation_date, last_maintenance_date, next_maintenance_date, notes
    } = req.body;
    
    if (!client_id || !device_type_id) {
      return res.status(400).json({ error: 'Client ID and device type are required' });
    }

    const result = await pool.query(
      `INSERT INTO devices (
        client_id, device_type_id, brand_id, model_id,
        custom_brand, custom_model, serial_number,
        installation_date, last_maintenance_date, next_maintenance_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        client_id, device_type_id, brand_id, model_id,
        custom_brand, custom_model, serial_number,
        installation_date, last_maintenance_date, next_maintenance_date, notes
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create device:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Update device
router.put('/:id', async (req, res) => {
  try {
    const {
      device_type_id, brand_id, model_id,
      custom_brand, custom_model, serial_number,
      installation_date, last_maintenance_date, next_maintenance_date, notes
    } = req.body;
    
    const result = await pool.query(
      `UPDATE devices 
       SET device_type_id = $1, brand_id = $2, model_id = $3,
           custom_brand = $4, custom_model = $5, serial_number = $6,
           installation_date = $7, last_maintenance_date = $8, 
           next_maintenance_date = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        device_type_id, brand_id, model_id,
        custom_brand, custom_model, serial_number,
        installation_date, last_maintenance_date, next_maintenance_date, notes,
        req.params.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Delete device
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM devices WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Failed to delete device:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export default router;

