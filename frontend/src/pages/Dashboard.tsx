import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface DashboardStats {
  clients: number;
  devices: number;
  tasks: number;
  pendingTasks: number;
  completedTasks: number;
  upcomingMaintenance: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/statistics/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return <Typography>{t('common.loading')}</Typography>;
  }

  const statCards = [
    { label: t('statistics.totalClients'), value: stats.clients, color: '#1976d2' },
    { label: t('statistics.totalDevices'), value: stats.devices, color: '#2e7d32' },
    { label: t('statistics.totalTasks'), value: stats.tasks, color: '#ed6c02' },
    { label: t('statistics.pendingTasks'), value: stats.pendingTasks, color: '#d32f2f' },
    { label: t('statistics.completedTasks'), value: stats.completedTasks, color: '#0288d1' },
    { label: t('statistics.upcomingMaintenance'), value: stats.upcomingMaintenance, color: '#7b1fa2' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('nav.dashboard')}
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {card.label}
                </Typography>
                <Typography variant="h3" component="div" sx={{ color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


