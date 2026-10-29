import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Active Computer Local Network IP (Wi-Fi)
const CURRENT_LAN_IP = '10.146.12.164';
const FALLBACK_IPS = ['10.146.12.164', '10.50.97.164'];

// Extract dynamic host from Expo's Metro bundler if available
const getMetroHost = () => {
  const hostUri = 
    Constants.expoConfig?.hostUri || 
    Constants.manifest2?.extra?.expoClient?.hostUri || 
    Constants.manifest?.debuggerHost || 
    '';
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  return null;
};

const metroHost = getMetroHost();

// Ordered list of candidate backend URLs prioritized for speed
const CANDIDATES = [
  // 1. Direct active Wi-Fi IP (known live at 10.50.97.164:5000)
  `http://${CURRENT_LAN_IP}:5000/api`,
  // 2. Metro host if detected dynamically
  metroHost ? `http://${metroHost}:5000/api` : null,
  // 3. Fallback LAN IPs
  ...FALLBACK_IPS.map(ip => `http://${ip}:5000/api`),
  // 4. Android emulator loopback & localhost
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : null,
  'http://127.0.0.1:5000/api',
  'http://localhost:5000/api',
].filter(Boolean);

// Deduplicate candidates
const candidateURLs = Array.from(new Set(CANDIDATES));

let currentBaseURLIndex = 0;
let activeBaseURL = candidateURLs[0];

console.log('[API Init] Active IP:', CURRENT_LAN_IP);
console.log('[API Init] Candidate endpoints:', candidateURLs);
console.log('[API Init] Active baseURL:', activeBaseURL);

export const api = axios.create({
  baseURL: activeBaseURL,
  timeout: 2500, // Rapid 2.5s timeout prevents UI freezing
  headers: {
    'Content-Type': 'application/json',
  }
});

// In-Memory Stale-While-Revalidate Cache for 0ms Instant Response
const responseCache = new Map();
const CACHE_TTL_MS = 25000; // 25 seconds for GET queries

export const invalidateApiCache = (pattern = null) => {
  if (!pattern) {
    responseCache.clear();
  } else {
    for (const key of responseCache.keys()) {
      if (key.includes(pattern)) {
        responseCache.delete(key);
      }
    }
  }
};

// Request Interceptor: Serve immediate memory cache if available for GET requests
api.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === 'get' && !config.skipCache) {
    const cacheKey = `${config.baseURL || activeBaseURL}${config.url}?${JSON.stringify(config.params || {})}`;
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK (Cache)',
        headers: {},
        config,
        request: {}
      });
    }
  }
  return config;
});

// Response Interceptor: Cache GET results, clear on mutations, and auto-failover
api.interceptors.response.use(
  (response) => {
    if (response.config.method?.toLowerCase() === 'get' && response.data) {
      const cacheKey = `${response.config.baseURL || activeBaseURL}${response.config.url}?${JSON.stringify(response.config.params || {})}`;
      responseCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    } else if (response.config.method && ['post', 'put', 'delete', 'patch'].includes(response.config.method.toLowerCase())) {
      responseCache.clear();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isNetworkError = 
      error.message === 'Network Error' || 
      error.code === 'ERR_NETWORK' || 
      error.code === 'ECONNABORTED' || 
      !error.response;

    if (isNetworkError && originalRequest && !originalRequest._retryingCandidate) {
      originalRequest._retryingCandidate = true;

      // Try remaining candidate endpoints with rapid 1500ms probe
      for (let i = 0; i < candidateURLs.length; i++) {
        if (i === currentBaseURLIndex) continue;

        const testURL = candidateURLs[i];
        console.log(`[API Failover] Probing endpoint (${i + 1}/${candidateURLs.length}): ${testURL}`);

        try {
          const endpointPath = originalRequest.url.startsWith('/') 
            ? originalRequest.url 
            : `/${originalRequest.url}`;
          const newFullURL = `${testURL}${endpointPath}`;

          const retryConfig = {
            ...originalRequest,
            url: newFullURL,
            baseURL: '',
            timeout: 1500,
          };

          const response = await axios(retryConfig);

          // Success! Switch activeBaseURL permanently
          currentBaseURLIndex = i;
          activeBaseURL = testURL;
          api.defaults.baseURL = testURL;
          console.log(`[API Failover SUCCESS] Switched active backend to: ${testURL}`);

          return response;
        } catch (failoverErr) {
          console.log(`[API Failover] Candidate ${testURL} failed:`, failoverErr.message);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
