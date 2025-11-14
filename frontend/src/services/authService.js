import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
export async function login(username, password) {
  const url = `${API_BASE}/api/auth/token`;
  const res = await axios.post(url, { grant_type: 'password', username, password });
  return res.data;
}
