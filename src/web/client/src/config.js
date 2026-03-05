const API_URL = process.env.REACT_APP_API_URL || window.location.origin || 'http://localhost:3001';
const config = {
  apiUrl: API_URL,
  socketUrl: API_URL,
  domain: 'spacebot.me'
};
export default config;
export { API_URL };
