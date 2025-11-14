import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export async function createSlot(payload) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Not authenticated');
  const url = `${API_BASE}/api/slots`;
  const res = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getSlot(id) {
  const token = localStorage.getItem('access_token');
  const url = `${API_BASE}/api/slots/${id}`;
  const res = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
}

export async function updateSlot(id, payload) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Not authenticated');
  const url = `${API_BASE}/api/slots/${id}`;
  const res = await axios.put(url, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getSlots(queryParams = {}) {
  const token = localStorage.getItem('access_token');
  const qs = new URLSearchParams(queryParams).toString();
  const url = `${API_BASE}/api/slots${qs ? '?' + qs : ''}`;
  const res = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
}

export async function searchSlots(query) {
  const token = localStorage.getItem('access_token');
  const url = `${API_BASE}/api/slots/search`;

  try {
    const res = await axios.get(url, {
      params: query,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return []; // Return empty array if no results
    }
    throw new Error(err.response?.data?.error_description || 'Failed to search slots');
  }
}

export async function deleteSlot(id) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Not authenticated');
  const url = `${API_BASE}/api/slots/${id}`;
  const res = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
