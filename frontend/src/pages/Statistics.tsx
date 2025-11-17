import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface DashboardStats {
  clients: number;
  devices: number;
  tasks: number;
  pendingTasks: number;
  completedTasks: number;
  upcomingMaintenance: number;
  devicesByType: Array<{ name: string; name_sl: string; count: number }>;
  tasksByStatus: Array<{ status: string; count: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Statistics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { i18n, t } = useTranslation();
  const isSlovenian = i18n.language === 'sl';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/statistics/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  if (!stats) {
    return <Typography>{t('common.loading')}</Typography>;
  }

  const deviceData = stats.devicesByType.map((item) => ({
    name: isSlovenian && item.name_sl ? item.name_sl : item.name,
    value: parseInt(item.count.toString()),
  }));

  const taskData = stats.tasksByStatus.map((item) => ({
    name: item.status,
    value: parseInt(item.count.toString()),
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('statistics.title')}
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('statistics.devicesByType')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('statistics.tasksByStatus')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}


