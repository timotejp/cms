import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 0) {
        await login(email, password);
      } else {
        if (!name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await register(email, password, name);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold" color="primary">
            {t('app.title')}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            {t('app.subtitle')}
          </Typography>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
            <Tab label={t('auth.login')} />
            <Tab label={t('auth.register')} />
          </Tabs>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            {tab === 1 && (
              <TextField
                fullWidth
                label={t('auth.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required
                autoComplete="name"
              />
            )}
            <TextField
              fullWidth
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete={tab === 0 ? 'current-password' : 'new-password'}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (tab === 0 ? t('auth.loginButton') : t('auth.registerButton'))}
            </Button>
          </form>
          <Typography variant="body2" align="center" color="text.secondary">
            {tab === 0 ? t('auth.noAccount') : t('auth.hasAccount')}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

