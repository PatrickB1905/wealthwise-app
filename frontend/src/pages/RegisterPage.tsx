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

          {error ? <Alert severity="error">{error}</Alert> : null}

          <form noValidate onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="First Name"
              required
              margin="normal"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
            <TextField
              fullWidth
              label="Last Name"
              required
              margin="normal"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
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
              autoComplete="new-password"
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
