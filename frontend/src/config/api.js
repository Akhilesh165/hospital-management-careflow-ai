// Central API config — all backend URLs come from env variables
// Node backend (auth, patients, appointments)
export const NODE_API = import.meta.env.VITE_NODE_API_URL || 'http://127.0.0.1:5000';
// Python backend (AI triage engine)
export const PYTHON_API = import.meta.env.VITE_PYTHON_API_URL || 'http://127.0.0.1:8000';
