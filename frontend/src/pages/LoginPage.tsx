import React, { useState } from 'react'
import { Alert, Link, TextField, Typography } from '@mui/material'
import axios from 'axios'
import { Link as RouterLink } from 'react-router-dom'
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

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string } | undefined)?.error
    return msg ?? fallback
  }
  return fallback
}

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

          {error && <Alert severity="error">{error}</Alert>}

          <form noValidate onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
