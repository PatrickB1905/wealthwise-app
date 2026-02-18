import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from '@mui/material'
import API from '../api/axios'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../api/http'
import {
  CenteredBox,
  PageCard,
  PageContainer,
  SectionContent,
  SectionHeader,
  StyledContainer,
} from '../components/layout/Styled'

type Profile = {
  id: number
  firstName: string
  lastName: string
  email: string
  createdAt: string
}

type BannerMsg = { type: 'success' | 'error'; text: string }

const ProfilePage: React.FC = () => {
  const { logout } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState<BannerMsg | null>(null)

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState<BannerMsg | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    API.get<Profile>('/auth/me')
      .then((res) => {
        setProfile(res.data)
        setNewEmail(res.data.email)
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'Failed to load profile')))
      .finally(() => setLoading(false))
  }, [])

  const handleEmailUpdate = async () => {
    setEmailMsg(null)
    try {
      const res = await API.put<{ email: string }>('/auth/me/email', { email: newEmail })
      setEmailMsg({ type: 'success', text: `Email updated to ${res.data.email}` })
    } catch (err: unknown) {
      setEmailMsg({ type: 'error', text: getApiErrorMessage(err, 'Email update failed') })
    }
  }

  const handlePasswordChange = async () => {
    setPwdMsg(null)
    try {
      await API.put('/auth/me/password', {
        currentPassword: currentPwd,
        newPassword: newPwd,
      })
      setPwdMsg({ type: 'success', text: 'Password updated' })
      setCurrentPwd('')
      setNewPwd('')
    } catch (err: unknown) {
      setPwdMsg({ type: 'error', text: getApiErrorMessage(err, 'Password change failed') })
    }
  }

  const handleDelete = async () => {
    setDeleteError('')
    try {
      await API.delete('/auth/me')
      logout()
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete account'))
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <CenteredBox>
          <CircularProgress />
        </CenteredBox>
      </PageContainer>
    )
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <StyledContainer>
          <Alert severity="error">{error || 'No profile data'}</Alert>
        </StyledContainer>
      </PageContainer>
    )
  }

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
            {emailMsg && (
              <Alert severity={emailMsg.type} sx={{ mb: 2 }}>
                {emailMsg.text}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
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
            {pwdMsg && (
              <Alert severity={pwdMsg.type} sx={{ mb: 2 }}>
                {pwdMsg.text}
              </Alert>
            )}
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              margin="normal"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              margin="normal"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
            <Button variant="contained" sx={{ mt: 1 }} onClick={handlePasswordChange}>
              Change Password
            </Button>
          </SectionContent>

          <Divider />

          <SectionContent>
            <Button variant="outlined" color="error" fullWidth onClick={() => setDeleteOpen(true)}>
              Delete Account
            </Button>
          </SectionContent>
        </PageCard>
      </StyledContainer>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete your account? This cannot be undone.
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  )
}

export default ProfilePage
