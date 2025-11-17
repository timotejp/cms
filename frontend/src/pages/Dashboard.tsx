import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Devices as DevicesIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface DashboardStats {
  clients: number;
  devices: number;
  tasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  upcomingMaintenance: number;
  overdueMaintenance: number;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold" sx={{ color }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color, opacity: 0.7 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/statistics/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return <Typography>{t('common.error')}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        {t('nav.dashboard')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.totalClients')}
            value={stats.clients}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.totalDevices')}
            value={stats.devices}
            icon={<DevicesIcon sx={{ fontSize: 40 }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.totalTasks')}
            value={stats.tasks}
            icon={<AssignmentIcon sx={{ fontSize: 40 }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.pendingTasks')}
            value={stats.pendingTasks}
            icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.inProgressTasks')}
            value={stats.inProgressTasks}
            icon={<AssignmentIcon sx={{ fontSize: 40 }} />}
            color="#0288d1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.completedTasks')}
            value={stats.completedTasks}
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.upcomingMaintenance')}
            value={stats.upcomingMaintenance}
            icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
            color="#7b1fa2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.overdueMaintenance')}
            value={stats.overdueMaintenance}
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

