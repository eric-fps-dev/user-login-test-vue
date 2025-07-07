
const USER_API_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL;
const MAINTENANCE_API_BASE_URL = import.meta.env.VITE_MAINTENANCE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_URL;

const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss' : 'ws';
const WS_PORT = import.meta.env.VITE_WS_PORT;
const WS_AUTO_URL = `${WS_PROTOCOL}://${window.location.hostname}:${WS_PORT}/ws`;

export default {
    USER_API_BASE_URL,
    MAINTENANCE_API_BASE_URL,
    WS_BASE_URL,
    WS_AUTO_URL,
  };