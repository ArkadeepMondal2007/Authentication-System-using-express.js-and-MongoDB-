import React, { useState } from "react"
import axios from "axios"
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom"
import Dashboard from "./Dashboard"
import "./App.css"

const API_BASE = "http://localhost:3000"

function AuthCard({ title, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="field-error">{message}</p>
}

function Signup() {
  const navigate = useNavigate()

  const [data, setData] = useState({
    name: "",
    email: "",
    passWord: "",
    role: "user",
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const next = {}
    if (!data.name.trim()) next.name = "Enter your name."
    if (!/^\S+@\S+\.\S+$/.test(data.email)) next.email = "Enter a valid email address."
    if (data.passWord.length < 8) next.passWord = "Use at least 8 characters."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await axios.post(`${API_BASE}/signUp`, data)
      navigate("/login")
    } catch (error) {
      console.error("Signup error:", error)
      setErrors({ form: "Signup failed. That email may already be registered." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Create your account">
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="signup-name">Name</label>
          <input
            id="signup-name"
            name="name"
            value={data.name}
            onChange={handleChange}
          />
          <FieldError message={errors.name} />
        </div>

        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={data.email}
            onChange={handleChange}
          />
          <FieldError message={errors.email} />
        </div>

        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            name="passWord"
            value={data.passWord}
            onChange={handleChange}
          />
          <FieldError message={errors.passWord} />
        </div>

        <div className="field">
          <label htmlFor="signup-role">Role</label>
          <select
            id="signup-role"
            name="role"
            value={data.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <FieldError message={errors.form} />

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthCard>
  )
}

function Login() {
  const navigate = useNavigate()

  const [data, setData] = useState({
    email: "",
    passWord: "",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(`${API_BASE}/login`, data)
      navigate("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      setError("Invalid email or password.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Log in">
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={data.email}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            name="passWord"
            value={data.passWord}
            onChange={handleChange}
          />
        </div>

        <FieldError message={error} />

        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </AuthCard>
  )
}

function ResetPassword() {
  const { token } = useParams()

  const [data, setData] = useState({ newPassword: "" })
  const [status, setStatus] = useState({ error: "", done: false })
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(`${API_BASE}/reset-password/${token}`, data)
      setStatus({ error: "", done: true })
    } catch (error) {
      console.error("Reset password error:", error)
      setStatus({
        error: "Couldn't reset your password. The link may have expired.",
        done: false,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (status.done) {
    return (
      <AuthCard title="Password reset">
        <p>Your password has been updated. You can now log in.</p>
        <p className="auth-switch">
          <Link to="/login">Go to login</Link>
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Reset your password">
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            name="newPassword"
            value={data.newPassword}
            onChange={handleChange}
          />
        </div>

        <FieldError message={status.error} />

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Reset password"}
        </button>
      </form>
    </AuthCard>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App