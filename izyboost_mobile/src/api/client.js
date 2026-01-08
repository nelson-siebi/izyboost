import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// CHANGE THIS URL TO YOUR LOCAL IP IF TESTING ON PHYSICAL DEVICE
// Android Emulator: http://10.0.2.2:8000/api
// iOS Simulator: http://localhost:8000/api
const BASE_URL = 'http://192.168.155.156:8000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to add the token
client.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
