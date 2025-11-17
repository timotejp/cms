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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Device {
  id: number;
  client_id: number;
  device_type_id?: number;
  brand_id?: number;
  model_id?: number;
  custom_brand?: string;
  custom_model?: string;
  serial_number?: string;
  installation_date?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  notes?: string;
  device_type_name?: string;
  device_type_name_sl?: string;
  brand_name?: string;
  model_name?: string;
}

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState<Partial<Device>>({});
  const [error, setError] = useState('');
  const { i18n, t } = useTranslation();
  const isSlovenian = i18n.language === 'sl';

  useEffect(() => {
    fetchDevices();
    fetchClients();
    fetchDeviceTypes();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (formData.brand_id) {
      fetchModels(formData.brand_id);
    } else {
      setModels([]);
    }
  }, [formData.brand_id]);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
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

  const fetchDeviceTypes = async () => {
    try {
      const response = await api.get('/devices/types');
      setDeviceTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch device types:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/devices/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchModels = async (brandId: number) => {
    try {
      const response = await api.get(`/devices/brands/${brandId}/models`);
      setModels(response.data);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleOpen = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setFormData(device);
      if (device.brand_id) {
        fetchModels(device.brand_id);
      }
    } else {
      setEditingDevice(null);
      setFormData({});
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDevice(null);
    setFormData({});
    setError('');
    setModels([]);
  };

  const handleSubmit = async () => {
    try {
      if (editingDevice) {
        await api.put(`/devices/${editingDevice.id}`, formData);
      } else {
        await api.post('/devices', formData);
      }
      fetchDevices();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save device');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await api.delete(`/devices/${id}`);
        fetchDevices();
      } catch (error) {
        console.error('Failed to delete device:', error);
      }
    }
  };

  const getDeviceTypeName = (device: Device) => {
    if (isSlovenian && device.device_type_name_sl) {
      return device.device_type_name_sl;
    }
    return device.device_type_name || '-';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('devices.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('devices.addDevice')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('devices.deviceType')}</TableCell>
              <TableCell>{t('devices.brand')}</TableCell>
              <TableCell>{t('devices.model')}</TableCell>
              <TableCell>{t('devices.serialNumber')}</TableCell>
              <TableCell>{t('devices.nextMaintenance')}</TableCell>
              <TableCell align="right">{t('common.edit')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t('devices.noDevices')}
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{getDeviceTypeName(device)}</TableCell>
                  <TableCell>{device.brand_name || device.custom_brand || '-'}</TableCell>
                  <TableCell>{device.model_name || device.custom_model || '-'}</TableCell>
                  <TableCell>{device.serial_number || '-'}</TableCell>
                  <TableCell>
                    {device.next_maintenance_date
                      ? new Date(device.next_maintenance_date).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(device)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(device.id)} size="small" color="error">
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
          {editingDevice ? t('devices.editDevice') : t('devices.addDevice')}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t('clients.title')}</InputLabel>
            <Select
              value={formData.client_id || ''}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value as number })}
              label={t('clients.title')}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t('devices.deviceType')}</InputLabel>
            <Select
              value={formData.device_type_id || ''}
              onChange={(e) => setFormData({ ...formData, device_type_id: e.target.value as number })}
              label={t('devices.deviceType')}
            >
              {deviceTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {isSlovenian && type.name_sl ? type.name_sl : type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('devices.brand')}</InputLabel>
            <Select
              value={formData.brand_id || ''}
              onChange={(e) => {
                const brandId = e.target.value as number;
                setFormData({ ...formData, brand_id: brandId, model_id: undefined });
                if (brandId) {
                  fetchModels(brandId);
                }
              }}
              label={t('devices.brand')}
            >
              <MenuItem value="">{t('devices.customBrand')}</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData.brand_id && (
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('devices.model')}</InputLabel>
              <Select
                value={formData.model_id || ''}
                onChange={(e) => setFormData({ ...formData, model_id: e.target.value as number })}
                label={t('devices.model')}
              >
                <MenuItem value="">{t('devices.customModel')}</MenuItem>
                {models.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {(!formData.brand_id || formData.brand_id === '') && (
            <TextField
              fullWidth
              label={t('devices.customBrand')}
              value={formData.custom_brand || ''}
              onChange={(e) => setFormData({ ...formData, custom_brand: e.target.value })}
              margin="normal"
            />
          )}
          {(!formData.model_id || formData.model_id === '') && (
            <TextField
              fullWidth
              label={t('devices.customModel')}
              value={formData.custom_model || ''}
              onChange={(e) => setFormData({ ...formData, custom_model: e.target.value })}
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            label={t('devices.serialNumber')}
            value={formData.serial_number || ''}
            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('devices.installationDate')}
            type="date"
            value={formData.installation_date || ''}
            onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label={t('devices.lastMaintenance')}
            type="date"
            value={formData.last_maintenance_date || ''}
            onChange={(e) => setFormData({ ...formData, last_maintenance_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label={t('devices.nextMaintenance')}
            type="date"
            value={formData.next_maintenance_date || ''}
            onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label={t('devices.notes')}
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


