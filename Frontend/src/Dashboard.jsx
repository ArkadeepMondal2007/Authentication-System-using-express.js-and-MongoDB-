import React from "react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  return (
    <div className="auth-page">
      <div className="auth-card dashboard-card">
        <h2>Dashboard</h2>
        <p>You're logged in.</p>
        <Link to="/login" className="button-link">
          Log out
        </Link>
      </div>
    </div>
  )
}

export default Dashboard