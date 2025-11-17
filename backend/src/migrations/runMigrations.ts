import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

export async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'technician',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Slovenia',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Device types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS device_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_sl VARCHAR(100),
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Brands table
    await client.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        logo_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Models table
    await client.query(`
      CREATE TABLE IF NOT EXISTS models (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        device_type_id INTEGER REFERENCES device_types(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Devices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        device_type_id INTEGER REFERENCES device_types(id),
        brand_id INTEGER REFERENCES brands(id),
        model_id INTEGER REFERENCES models(id),
        custom_brand VARCHAR(100),
        custom_model VARCHAR(100),
        serial_number VARCHAR(100),
        installation_date DATE,
        last_maintenance_date DATE,
        next_maintenance_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        scheduled_date DATE,
        completed_date TIMESTAMP,
        estimated_duration INTEGER,
        actual_duration INTEGER,
        technician_notes TEXT,
        materials_used TEXT,
        cost DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notification settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email_enabled BOOLEAN DEFAULT true,
        sms_enabled BOOLEAN DEFAULT false,
        app_enabled BOOLEAN DEFAULT true,
        days_before_reminder INTEGER DEFAULT 30,
        smtp_host VARCHAR(255),
        smtp_port INTEGER,
        smtp_user VARCHAR(255),
        smtp_password VARCHAR(255),
        twilio_account_sid VARCHAR(255),
        twilio_auth_token VARCHAR(255),
        twilio_phone_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default device types
    await client.query(`
      INSERT INTO device_types (name, name_sl, icon) VALUES
      ('Air Conditioning', 'Klimatizacija', 'ac_unit'),
      ('Heat Pump', 'Toplotna črpalka', 'thermostat'),
      ('Gas Boiler', 'Plinski kotel', 'local_fire_department'),
      ('Burner', 'Gorilnik', 'whatshot'),
      ('Custom', 'Po meri', 'build')
      ON CONFLICT DO NOTHING
    `);

    // Insert popular brands
    await client.query(`
      INSERT INTO brands (name) VALUES
      ('Daikin'), ('Mitsubishi Electric'), ('Panasonic'), ('LG'), ('Samsung'),
      ('Vaillant'), ('Viessmann'), ('Bosch'), ('Buderus'), ('Junkers'),
      ('Weishaupt'), ('Riello'), ('Baxi'), ('Ariston'), ('Ferroli'),
      ('Grundfos'), ('Wilo'), ('Danfoss'), ('Honeywell')
      ON CONFLICT (name) DO NOTHING
    `);

    // Get device type IDs for model insertion
    const deviceTypesResult = await client.query('SELECT id, name FROM device_types');
    const deviceTypeMap: { [key: string]: number } = {};
    deviceTypesResult.rows.forEach((row: any) => {
      deviceTypeMap[row.name] = row.id;
    });

    // Get brand IDs
    const brandsResult = await client.query('SELECT id, name FROM brands');
    const brandMap: { [key: string]: number } = {};
    brandsResult.rows.forEach((row: any) => {
      brandMap[row.name] = row.id;
    });

    // Insert popular models
    const models = [
      { brand: 'Daikin', model: 'VRV 4', type: 'Air Conditioning' },
      { brand: 'Daikin', model: 'Sensira', type: 'Air Conditioning' },
      { brand: 'Mitsubishi Electric', model: 'City Multi', type: 'Air Conditioning' },
      { brand: 'Mitsubishi Electric', model: 'MSZ-AP', type: 'Air Conditioning' },
      { brand: 'Vaillant', model: 'ecoTEC plus', type: 'Gas Boiler' },
      { brand: 'Vaillant', model: 'aroTHERM', type: 'Heat Pump' },
      { brand: 'Viessmann', model: 'Vitodens 100-W', type: 'Gas Boiler' },
      { brand: 'Viessmann', model: 'Vitocal 200-A', type: 'Heat Pump' },
      { brand: 'Bosch', model: 'Condens 5000 W', type: 'Gas Boiler' },
      { brand: 'Weishaupt', model: 'WTC-O', type: 'Burner' },
      { brand: 'Riello', model: 'RS 34', type: 'Burner' },
    ];

    for (const m of models) {
      const brandId = brandMap[m.brand];
      const deviceTypeId = deviceTypeMap[m.type];
      if (brandId && deviceTypeId) {
        await client.query(
          'INSERT INTO models (brand_id, name, device_type_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [brandId, m.model, deviceTypeId]
        );
      }
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ('admin@heatingcms.com', $1, 'Admin User', 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [hashedPassword]
    );

    await client.query('COMMIT');
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    client.release();
  }
}

