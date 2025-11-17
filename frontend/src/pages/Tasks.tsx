import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Task {
  id: number;
  client_id: number;
  device_id?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  technician_notes?: string;
  materials_used?: string;
  cost?: number;
  client_name?: string;
  device_serial?: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [taskMode, setTaskMode] = useState<'quick' | 'advanced'>('quick');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { t } = useTranslation();

  useEffect(() => {
    fetchTasks();
    fetchClients();
  }, [statusFilter]);

  useEffect(() => {
    if (formData.client_id) {
      fetchDevices(formData.client_id);
    } else {
      setDevices([]);
    }
  }, [formData.client_id]);

  const fetchTasks = async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await api.get('/tasks', { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchDevices = async (clientId: number) => {
    try {
      const response = await api.get(`/devices/client/${clientId}`);
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const handleOpen = (task?: Task, mode: 'quick' | 'advanced' = 'quick') => {
    if (task) {
      setEditingTask(task);
      setFormData(task);
      setTaskMode('advanced');
      if (task.client_id) {
        fetchDevices(task.client_id);
      }
    } else {
      setEditingTask(null);
      setFormData({ status: 'pending', priority: 'medium' });
      setTaskMode(mode);
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setFormData({});
    setError('');
    setDevices([]);
  };

  const handleSubmit = async () => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      fetchTasks();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save task');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('tasks.title')}</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpen(undefined, 'quick')}
            sx={{ mr: 1 }}
          >
            {t('tasks.quickTask')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen(undefined, 'advanced')}
          >
            {t('tasks.advancedTask')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('tasks.filterByStatus')}</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label={t('tasks.filterByStatus')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">{t('tasks.statusPending')}</MenuItem>
            <MenuItem value="in_progress">{t('tasks.statusInProgress')}</MenuItem>
            <MenuItem value="completed">{t('tasks.statusCompleted')}</MenuItem>
            <MenuItem value="cancelled">{t('tasks.statusCancelled')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('tasks.title')}</TableCell>
              <TableCell>{t('tasks.client')}</TableCell>
              <TableCell>{t('tasks.device')}</TableCell>
              <TableCell>{t('tasks.status')}</TableCell>
              <TableCell>{t('tasks.priority')}</TableCell>
              <TableCell>{t('tasks.scheduledDate')}</TableCell>
              <TableCell align="right">{t('common.edit')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {t('tasks.noTasks')}
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.client_name || '-'}</TableCell>
                  <TableCell>{task.device_serial || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`tasks.status${task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', '')}`)}
                      color={getStatusColor(task.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`tasks.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)}
                      color={getPriorityColor(task.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {task.scheduled_date
                      ? new Date(task.scheduled_date).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(task, 'advanced')} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(task.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {editingTask ? t('tasks.editTask') : (taskMode === 'quick' ? t('tasks.quickTask') : t('tasks.advancedTask'))}
            </span>
            {!editingTask && (
              <Tabs value={taskMode === 'quick' ? 0 : 1} onChange={(e, v) => setTaskMode(v === 0 ? 'quick' : 'advanced')}>
                <Tab label={t('tasks.quickTask')} />
                <Tab label={t('tasks.advancedTask')} />
              </Tabs>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t('tasks.client')}</InputLabel>
            <Select
              value={formData.client_id || ''}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value as number, device_id: undefined })}
              label={t('tasks.client')}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData.client_id && (
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tasks.device')}</InputLabel>
              <Select
                value={formData.device_id || ''}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value as number })}
                label={t('tasks.device')}
              >
                <MenuItem value="">None</MenuItem>
                {devices.map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {device.device_type_name || device.device_type_name_sl} - {device.serial_number || 'N/A'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            fullWidth
            label={t('tasks.title')}
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('tasks.description')}
            multiline
            rows={3}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tasks.status')}</InputLabel>
              <Select
                value={formData.status || 'pending'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label={t('tasks.status')}
              >
                <MenuItem value="pending">{t('tasks.statusPending')}</MenuItem>
                <MenuItem value="in_progress">{t('tasks.statusInProgress')}</MenuItem>
                <MenuItem value="completed">{t('tasks.statusCompleted')}</MenuItem>
                <MenuItem value="cancelled">{t('tasks.statusCancelled')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tasks.priority')}</InputLabel>
              <Select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                label={t('tasks.priority')}
              >
                <MenuItem value="low">{t('tasks.priorityLow')}</MenuItem>
                <MenuItem value="medium">{t('tasks.priorityMedium')}</MenuItem>
                <MenuItem value="high">{t('tasks.priorityHigh')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TextField
            fullWidth
            label={t('tasks.scheduledDate')}
            type="date"
            value={formData.scheduled_date || ''}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          {(taskMode === 'advanced' || editingTask) && (
            <>
              <TextField
                fullWidth
                label={t('tasks.estimatedDuration')}
                type="number"
                value={formData.estimated_duration || ''}
                onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || undefined })}
                margin="normal"
              />
              {formData.status === 'completed' && (
                <>
                  <TextField
                    fullWidth
                    label={t('tasks.completedDate')}
                    type="datetime-local"
                    value={formData.completed_date ? new Date(formData.completed_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, completed_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label={t('tasks.actualDuration')}
                    type="number"
                    value={formData.actual_duration || ''}
                    onChange={(e) => setFormData({ ...formData, actual_duration: parseInt(e.target.value) || undefined })}
                    margin="normal"
                  />
                </>
              )}
              <TextField
                fullWidth
                label={t('tasks.technicianNotes')}
                multiline
                rows={3}
                value={formData.technician_notes || ''}
                onChange={(e) => setFormData({ ...formData, technician_notes: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label={t('tasks.materialsUsed')}
                multiline
                rows={2}
                value={formData.materials_used || ''}
                onChange={(e) => setFormData({ ...formData, materials_used: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label={t('tasks.cost')}
                type="number"
                value={formData.cost || ''}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || undefined })}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


