import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach token to every request if present
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Voter
export const getCandidates = () => API.get('/voter/candidates');
export const castVote = (candidateId) => API.post('/voter/vote', { candidateId });
export const getElectionState = () => API.get('/voter/state');
export const getResults = () => API.get('/voter/results');

// Admin
export const addCandidate = (data) => API.post('/admin/candidates', data);
export const deleteCandidate = (id) => API.delete(`/admin/candidates/${id}`);
export const getAdminState = () => API.get('/admin/state');
export const updateElectionState = (status) => API.put('/admin/state', { electionStatus: status });
export const getBlockchain = () => API.get('/admin/blockchain');
