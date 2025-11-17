import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Chip,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
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
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    fetchClients();
  }, [search]);

  const fetchClients = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const response = await api.get('/clients', { params });
      setClients(response.data.data || response.data);
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
      setFormData({ country: 'Slovenia' });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">{t('clients.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('clients.addClient')}
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder={t('clients.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {clients.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              {t('clients.noClients')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {client.name}
                    </Typography>
                    <Box>
                      <IconButton onClick={() => handleOpen(client)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(client.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  {client.email && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📧 {client.email}
                    </Typography>
                  )}
                  {client.phone && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📞 {client.phone}
                    </Typography>
                  )}
                  {client.city && (
                    <Chip label={client.city} size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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

