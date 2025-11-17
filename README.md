# Heating System Client Management System

A comprehensive client management system for service technicians maintaining heating systems (AC, Heat Pumps, Gas Boilers, Burners, and custom devices). Built with React, Node.js, Express, and PostgreSQL, designed for easy deployment on Portainer.

## Features

- **Client Management**: Add, edit, and manage client information
- **Device Management**: Track devices with popular brands and models (Daikin, Mitsubishi, Vaillant, Viessmann, Bosch, etc.)
- **Task Management**: 
  - Quick task creation for fast entry
  - Advanced task creation with detailed information
  - Task status tracking (pending, in progress, completed, cancelled)
  - Priority levels (low, medium, high)
- **Statistics Dashboard**: View overview statistics and charts
- **Multi-language Support**: English and Slovenian (Slovenščina)
- **Notification Settings**: Configure email, SMS, and app notifications for yearly maintenance reminders
- **Responsive Design**: Works on desktop and mobile (prepared for future Android app)

## Technology Stack

- **Frontend**: React 18 with TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **i18n**: react-i18next

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Portainer (for GUI management)
- Nginx Proxy Manager (for reverse proxy - optional but recommended)

### Deployment

**For detailed step-by-step Portainer deployment instructions, see [PORTAINER_SETUP.md](./PORTAINER_SETUP.md)**

### Quick Portainer Deployment

1. **Prepare files on your server**:
   ```bash
   # Clone or upload files to your server
   git clone <repo-url> /opt/heating-cms
   cd /opt/heating-cms
   ```

2. **In Portainer**:
   - Go to **Stacks** → **Add Stack**
   - Name: `heating-cms`
   - Build method: **Web editor**
   - Paste contents of `docker-compose.yml`
   - Click **Deploy the stack**

3. **Configure Nginx Proxy Manager** (see PORTAINER_SETUP.md for details):
   - Create proxy host for frontend (port 3000)
   - Create proxy host for backend API (port 3001)
   - Configure SSL certificates

4. **Default Login**:
   - Email: `admin@heatingcms.com`
   - Password: `admin123`
   - **⚠️ Change this immediately after first login!**

### Direct Docker Compose Deployment

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── migrations/       # Database migrations
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # API routes
│   │   └── server.ts         # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # React context (Auth)
│   │   ├── locales/          # Translation files
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/client/:clientId` - Get devices by client
- `GET /api/devices/types` - Get device types
- `GET /api/devices/brands` - Get brands
- `GET /api/devices/brands/:brandId/models` - Get models by brand
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Tasks
- `GET /api/tasks` - Get all tasks (with optional filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Statistics
- `GET /api/statistics/dashboard` - Get dashboard statistics

### Settings
- `GET /api/settings/notifications` - Get notification settings
- `PUT /api/settings/notifications` - Update notification settings

## Popular Brands & Models Included

### Air Conditioning
- Daikin (VRV 4, Sensira)
- Mitsubishi Electric (City Multi, MSZ-AP)

### Heat Pumps
- Vaillant (aroTHERM)
- Viessmann (Vitocal 200-A)

### Gas Boilers
- Vaillant (ecoTEC plus)
- Viessmann (Vitodens 100-W)
- Bosch (Condens 5000 W)

### Burners
- Weishaupt (WTC-O)
- Riello (RS 34)

You can also add custom brands and models for any device type.

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Backend server port (default: 3001)
- `JWT_SECRET` - Secret key for JWT tokens

### Frontend
- `REACT_APP_API_URL` - Backend API URL

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## Security Notes

- Change the default admin password after first login
- Update `JWT_SECRET` in production
- Use environment variables for sensitive data
- Configure proper CORS settings for production
- Use HTTPS in production

## Future Enhancements

- Android mobile app (API is ready)
- Email/SMS notification sending implementation
- Maintenance reminder scheduler
- PDF report generation
- Image uploads for devices/tasks
- Calendar view for scheduled tasks
- Export functionality (CSV, PDF)

## License

This project is provided as-is for use in client management for heating system maintenance.

## Support

For issues or questions, please check the codebase or create an issue in your repository.


