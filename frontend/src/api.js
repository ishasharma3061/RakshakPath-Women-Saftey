import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000'
});

export const sendSOS = (data) => API.post('/api/sos', data);
export const reportDanger = (data) => API.post('/api/report', data);
export const getDangers = () => API.get('/api/dangers');
