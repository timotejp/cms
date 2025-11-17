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
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleOpen = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({});
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingClient(null);
    setFormData({});
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      fetchClients();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save client');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('clients.deleteConfirm'))) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('clients.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('clients.addClient')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('clients.name')}</TableCell>
              <TableCell>{t('clients.email')}</TableCell>
              <TableCell>{t('clients.phone')}</TableCell>
              <TableCell>{t('clients.city')}</TableCell>
              <TableCell align="right">{t('common.edit')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('clients.noClients')}
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>{client.city || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(client)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(client.id)} size="small" color="error">
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
          {editingClient ? t('clients.editClient') : t('clients.addClient')}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label={t('clients.name')}
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('clients.email')}
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('clients.phone')}
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('clients.address')}
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('clients.city')}
            value={formData.city || ''}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('clients.postalCode')}
            value={formData.postal_code || ''}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('clients.country')}
            value={formData.country || 'Slovenia'}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('clients.notes')}
            multiline
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
          />
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


