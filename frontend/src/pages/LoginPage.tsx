import React, { useState } from 'react'
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

import { getErrorMessage } from '../api/http'
import { useAuth } from '../context/useAuth'

import {
  AuthContainer,
  AuthPaper,
  FormButton,
  FormFooter,
  FormHeader,
  HeroOverlay,
  HeroSection,
} from '../components/layout/Styled'

const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed'))
    }
  }

  return (
    <HeroSection>
      <HeroOverlay />

      <AuthContainer maxWidth="xs">
        <AuthPaper elevation={6}>
          <FormHeader>
            <Typography variant="h5" component="h1">
              Login to WealthWise
            </Typography>
          </FormHeader>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <form noValidate onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <FormButton type="submit" fullWidth variant="contained">
              Login
            </FormButton>
          </form>

          <FormFooter>
            <Link component={RouterLink} to="/register" variant="body2">
              Don&apos;t have an account? Register
            </Link>
          </FormFooter>
        </AuthPaper>
      </AuthContainer>
    </HeroSection>
  )
}

export default LoginPage
