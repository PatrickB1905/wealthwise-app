import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
} from '@mui/material';
import API          from '../api/axios';
import { useAuth }  from '../context/AuthContext';
import {
  PageContainer,
  PageCard,
  SectionHeader,
  SectionContent,
  CenteredBox,
  StyledContainer,
} from '../components/layout/Styled';

interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const [profile, setProfile]       = useState<Profile|null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [newEmail, setNewEmail]     = useState('');
  const [emailMsg, setEmailMsg]     = useState<{type:'success'|'error';text:string}|null>(null);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [pwdMsg, setPwdMsg]         = useState<{type:'success'|'error';text:string}|null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    API.get<Profile>('/auth/me')
      .then(res => {
        setProfile(res.data);
        setNewEmail(res.data.email);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <CenteredBox>
          <CircularProgress />
        </CenteredBox>
      </PageContainer>
    );
  }
  if (error || !profile) {
    return (
      <PageContainer>
        <StyledContainer>
          <Alert severity="error">{error||'No profile data'}</Alert>
        </StyledContainer>
      </PageContainer>
    );
  }

  const handleEmailUpdate = async () => {
    setEmailMsg(null);
    try {
      const res = await API.put<{ email: string }>('/auth/me/email', { email: newEmail });
      setEmailMsg({ type:'success', text:`Email updated to ${res.data.email}` });
    } catch (e:any) {
      setEmailMsg({ type:'error', text:e.response?.data?.error||'Email update failed' });
    }
  };

  const handlePasswordChange = async () => {
    setPwdMsg(null);
    try {
      await API.put('/auth/me/password', {
        currentPassword: currentPwd,
        newPassword: newPwd,
      });
      setPwdMsg({ type:'success', text:'Password updated' });
      setCurrentPwd(''); setNewPwd('');
    } catch (e:any) {
      setPwdMsg({ type:'error', text:e.response?.data?.error||'Password change failed' });
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    try {
      await API.delete('/auth/me');
      logout();
    } catch (e:any) {
      setDeleteError(e.response?.data?.error||'Failed to delete account');
    }
  };

  return (
    <PageContainer>
      <StyledContainer>
        <PageCard>
          <SectionHeader title="My Profile" />
          <SectionContent>
            <Typography gutterBottom>
              <strong>Name:</strong> {profile.firstName} {profile.lastName}
            </Typography>
            <Typography color="text.secondary">
              <strong>Member since:</strong> {new Date(profile.createdAt).toLocaleString()}
            </Typography>
          </SectionContent>

          <Divider />

          <SectionContent>
            <Typography variant="subtitle1" gutterBottom>
              Update Email
            </Typography>
            {emailMsg && <Alert severity={emailMsg.type} sx={{ mb: 2 }}>{emailMsg.text}</Alert>}
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={newEmail}
              onChange={(e)=>setNewEmail(e.target.value)}
            />
            <Button variant="contained" onClick={handleEmailUpdate} sx={{ mt: 1 }}>
              Update Email
            </Button>
          </SectionContent>

          <Divider />

          <SectionContent>
            <Typography variant="subtitle1" gutterBottom>
              Change Password
            </Typography>
            {pwdMsg && <Alert severity={pwdMsg.type} sx={{ mb: 2 }}>{pwdMsg.text}</Alert>}
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              margin="normal"
              value={currentPwd}
              onChange={(e)=>setCurrentPwd(e.target.value)}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              margin="normal"
              value={newPwd}
              onChange={(e)=>setNewPwd(e.target.value)}
            />
            <Button variant="contained" sx={{ mt: 1 }} onClick={handlePasswordChange}>
              Change Password
            </Button>
          </SectionContent>

          <Divider />

          <SectionContent>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={()=>setDeleteOpen(true)}
            >
              Delete Account
            </Button>
          </SectionContent>
        </PageCard>
      </StyledContainer>

      <Dialog open={deleteOpen} onClose={()=>setDeleteOpen(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete your account? This cannot be undone.
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt:2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ProfilePage;