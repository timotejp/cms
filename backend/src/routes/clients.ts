import express from 'express';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Get all clients with search and pagination
router.get('/', async (req, res) => {
  try {
    const { search, page = '1', limit = '50' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = 'SELECT * FROM clients';
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` WHERE name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY name ASC LIMIT $' + paramCount + ' OFFSET $' + (paramCount + 1);
    params.push(parseInt(limit as string), offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM clients' + (search ? ` WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1` : ''), search ? [`%${search}%`] : []);

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create client
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, city, postal_code, country, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      `INSERT INTO clients (name, email, phone, address, city, postal_code, country, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, email, phone, address, city, postal_code, country || 'Slovenia', notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, city, postal_code, country, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      `UPDATE clients 
       SET name = $1, email = $2, phone = $3, address = $4, city = $5, 
           postal_code = $6, country = $7, notes = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, email, phone, address, city, postal_code, country, notes, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Failed to delete client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;

