import React from 'react';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const LoginPage: React.FC = () => (
  <Container maxWidth="sm">
    <Box sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Login to WealthWise
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField fullWidth margin="normal" label="Email" type="email" required />
        <TextField fullWidth margin="normal" label="Password" type="password" required />
        <Button fullWidth variant="contained" sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/register">
          Don't have an account? Register
        </Link>
      </Box>
    </Box>
  </Container>
);

export default LoginPage;