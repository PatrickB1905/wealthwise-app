import React from 'react';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const RegisterPage: React.FC = () => (
  <Container maxWidth="sm">
    <Box sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Register for WealthWise
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField fullWidth margin="normal" label="Name" required />
        <TextField fullWidth margin="normal" label="Email" type="email" required />
        <TextField fullWidth margin="normal" label="Password" type="password" required />
        <Button fullWidth variant="contained" sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/login">
          Already have an account? Login
        </Link>
      </Box>
    </Box>
  </Container>
);

export default RegisterPage;