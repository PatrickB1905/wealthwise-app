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

const RegisterPage: React.FC = () => {
  const { register } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await register(firstName, lastName, email, password)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed'))
    }
  }

  return (
    <HeroSection>
      <HeroOverlay />

      <AuthContainer maxWidth="xs">
        <AuthPaper elevation={6}>
          <FormHeader>
            <Typography variant="h5" component="h1">
              Register for WealthWise
            </Typography>
          </FormHeader>

          {error && <Alert severity="error">{error}</Alert>}

          <form noValidate onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="First Name"
              required
              margin="normal"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Last Name"
              required
              margin="normal"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
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
              Register
            </FormButton>
          </form>

          <FormFooter>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Login
            </Link>
          </FormFooter>
        </AuthPaper>
      </AuthContainer>
    </HeroSection>
  )
}

export default RegisterPage
