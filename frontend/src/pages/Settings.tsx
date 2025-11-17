import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  app_enabled: boolean;
  days_before_reminder: number;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    sms_enabled: false,
    app_enabled: true,
    days_before_reminder: 30,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/notifications');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/settings/notifications', settings);
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save settings');
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        {t('settings.title')}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('settings.language')}
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t('settings.language')}</InputLabel>
            <Select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              label={t('settings.language')}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="sl">Slovenščina</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('settings.notifications')}
          </Typography>
          {saved && <Alert severity="success" sx={{ mb: 2 }}>{t('settings.saved')}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.email_enabled}
                    onChange={(e) => setSettings({ ...settings, email_enabled: e.target.checked })}
                  />
                }
                label={t('settings.emailEnabled')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sms_enabled}
                    onChange={(e) => setSettings({ ...settings, sms_enabled: e.target.checked })}
                  />
                }
                label={t('settings.smsEnabled')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.app_enabled}
                    onChange={(e) => setSettings({ ...settings, app_enabled: e.target.checked })}
                  />
                }
                label={t('settings.appEnabled')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.daysBeforeReminder')}
                type="number"
                value={settings.days_before_reminder}
                onChange={(e) => setSettings({ ...settings, days_before_reminder: parseInt(e.target.value) || 30 })}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            {t('settings.smtpSettings')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.smtpHost')}
                value={settings.smtp_host || ''}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                disabled={!settings.email_enabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.smtpPort')}
                type="number"
                value={settings.smtp_port || ''}
                onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) || undefined })}
                disabled={!settings.email_enabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.smtpUser')}
                value={settings.smtp_user || ''}
                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                disabled={!settings.email_enabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.smtpPassword')}
                type="password"
                value={settings.smtp_password || ''}
                onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                disabled={!settings.email_enabled}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            {t('settings.twilioSettings')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.twilioAccountSid')}
                value={settings.twilio_account_sid || ''}
                onChange={(e) => setSettings({ ...settings, twilio_account_sid: e.target.value })}
                disabled={!settings.sms_enabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.twilioAuthToken')}
                type="password"
                value={settings.twilio_auth_token || ''}
                onChange={(e) => setSettings({ ...settings, twilio_auth_token: e.target.value })}
                disabled={!settings.sms_enabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.twilioPhoneNumber')}
                value={settings.twilio_phone_number || ''}
                onChange={(e) => setSettings({ ...settings, twilio_phone_number: e.target.value })}
                disabled={!settings.sms_enabled}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleSave}>
              {t('settings.save')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

