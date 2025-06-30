import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get<Profile>('/auth/me');
        setProfile(res.data);
        setNewEmail(res.data.email);
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !profile) {
    return <Alert severity="error">{error || 'No profile data'}</Alert>;
  }

  const handleEmailUpdate = async () => {
    setEmailMsg(null);
    try {
      const res = await API.put<{ email: string }>('/auth/me/email', { email: newEmail });
      setEmailMsg({ type: 'success', text: `Email updated to ${res.data.email}` });
    } catch (e: any) {
      setEmailMsg({ type: 'error', text: e.response?.data?.error || 'Email update failed' });
    }
  };

  const handlePasswordChange = async () => {
    setPwdMsg(null);
    try {
      await API.put('/auth/me/password', {
        currentPassword: currentPwd,
        newPassword: newPwd,
      });
      setPwdMsg({ type: 'success', text: 'Password updated' });
      setCurrentPwd('');
      setNewPwd('');
    } catch (e: any) {
      setPwdMsg({ type: 'error', text: e.response?.data?.error || 'Password change failed' });
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    try {
      await API.delete('/auth/me');
      logout();
    } catch (e: any) {
      setDeleteError(e.response?.data?.error || 'Failed to delete account');
    }
  };

  return (
    <Container sx={{ mt: 4, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" gutterBottom>
        Name: {profile.firstName} {profile.lastName}
      </Typography>
      <Typography variant="body2" gutterBottom>
        Member since: {new Date(profile.createdAt).toLocaleString()}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">Update Email</Typography>
        {emailMsg && <Alert severity={emailMsg.type}>{emailMsg.text}</Alert>}
        <TextField
          fullWidth
          label="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" onClick={handleEmailUpdate}>
          Update Email
        </Button>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="subtitle1">Change Password</Typography>
        {pwdMsg && <Alert severity={pwdMsg.type}>{pwdMsg.text}</Alert>}
        <TextField
          fullWidth
          label="Current Password"
          type="password"
          value={currentPwd}
          onChange={(e) => setCurrentPwd(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" sx={{ mt: 1 }} onClick={handlePasswordChange}>
          Change Password
        </Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
          Delete Account
        </Button>
      </Box>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete your account? This action cannot be undone.
          </Typography>
          {deleteError && <Alert severity="error">{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;