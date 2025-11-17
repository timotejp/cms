import express from 'express';
import { pool } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      clientsCount,
      devicesCount,
      tasksCount,
      pendingTasks,
      completedTasks,
      devicesByType,
      tasksByStatus,
      upcomingMaintenance
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM clients'),
      pool.query('SELECT COUNT(*) as count FROM devices'),
      pool.query('SELECT COUNT(*) as count FROM tasks'),
      pool.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'"),
      pool.query(`
        SELECT dt.name, dt.name_sl, COUNT(d.id) as count
        FROM device_types dt
        LEFT JOIN devices d ON dt.id = d.device_type_id
        GROUP BY dt.id, dt.name, dt.name_sl
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT status, COUNT(*) as count
        FROM tasks
        GROUP BY status
      `),
      pool.query(`
        SELECT COUNT(*) as count
        FROM devices
        WHERE next_maintenance_date IS NOT NULL
        AND next_maintenance_date <= CURRENT_DATE + INTERVAL '30 days'
      `)
    ]);

    res.json({
      clients: parseInt(clientsCount.rows[0].count),
      devices: parseInt(devicesCount.rows[0].count),
      tasks: parseInt(tasksCount.rows[0].count),
      pendingTasks: parseInt(pendingTasks.rows[0].count),
      completedTasks: parseInt(completedTasks.rows[0].count),
      devicesByType: devicesByType.rows,
      tasksByStatus: tasksByStatus.rows,
      upcomingMaintenance: parseInt(upcomingMaintenance.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;


