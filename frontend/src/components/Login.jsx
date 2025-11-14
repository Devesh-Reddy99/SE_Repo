import React, { useState } from 'react';
import { login } from '../services/authService';
import './Login.css';
import './Slots.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('Logging in...');
    try {
      // normalize username to avoid accidental whitespace or capitalization issues
      const normalizedUsername = username.trim().toLowerCase();
      const data = await login(normalizedUsername, password);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMsg('Login successful: ' + data.user.username);
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(), 500);
      }
    } catch (err) {
      // show detailed info to help debugging network/server issues
      const status = err.response?.status;
      const serverMsg = err.response?.data?.error_description || err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;
      setMsg(status ? `Error ${status}: ${serverMsg}` : `Error: ${serverMsg}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h3>Login</h3>
        </div>

        <form className="login-form" onSubmit={submit}>
          <div className="input-group">
            <input
              className="login-input"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              className="login-input"
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="button-group">
            <button className="login-button" type="submit">
              Login
            </button>
          </div>
        </form>

        <div className="message-box">{msg}</div>
      </div>
    </div>
  );
}