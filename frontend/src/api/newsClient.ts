import axios from 'axios';

const NewsAPI = axios.create({
  baseURL: 'http://localhost:6500/api',
  headers: { 'Content-Type': 'application/json' },
});

export default NewsAPI;