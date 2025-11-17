import express from 'express';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Get notification settings
router.get('/notifications', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notification_settings WHERE user_id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      // Create default settings
      const defaultSettings = await pool.query(
        `INSERT INTO notification_settings (user_id) VALUES ($1) RETURNING *`,
        [req.userId]
      );
      return res.json(defaultSettings.rows[0]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification settings
router.put('/notifications', async (req: AuthRequest, res) => {
  try {
    const {
      email_enabled, sms_enabled, app_enabled, days_before_reminder,
      smtp_host, smtp_port, smtp_user, smtp_password,
      twilio_account_sid, twilio_auth_token, twilio_phone_number
    } = req.body;
    
    // Check if settings exist
    const existing = await pool.query(
      'SELECT id FROM notification_settings WHERE user_id = $1',
      [req.userId]
    );
    
    let result;
    if (existing.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO notification_settings (
          user_id, email_enabled, sms_enabled, app_enabled, days_before_reminder,
          smtp_host, smtp_port, smtp_user, smtp_password,
          twilio_account_sid, twilio_auth_token, twilio_phone_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          req.userId, email_enabled, sms_enabled, app_enabled, days_before_reminder,
          smtp_host, smtp_port, smtp_user, smtp_password,
          twilio_account_sid, twilio_auth_token, twilio_phone_number
        ]
      );
    } else {
      result = await pool.query(
        `UPDATE notification_settings 
         SET email_enabled = $1, sms_enabled = $2, app_enabled = $3, days_before_reminder = $4,
             smtp_host = $5, smtp_port = $6, smtp_user = $7, smtp_password = $8,
             twilio_account_sid = $9, twilio_auth_token = $10, twilio_phone_number = $11,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $12
         RETURNING *`,
        [
          email_enabled, sms_enabled, app_enabled, days_before_reminder,
          smtp_host, smtp_port, smtp_user, smtp_password,
          twilio_account_sid, twilio_auth_token, twilio_phone_number, req.userId
        ]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

export default router;


