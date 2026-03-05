const API_URL = process.env.REACT_APP_API_URL || window.location.origin || 'http://localhost:3001';
const config = {
  apiUrl: API_URL,
  socketUrl: API_URL,
  domain: 'spacebot.me',
  inviteUrl: 'https://discord.com/oauth2/authorize?client_id=710260223536922705&permissions=2482302544&integration_type=0&scope=bot',
  supportUrl: 'https://discord.gg/CFRKf8mXe4',
  websiteUrl: 'https://spacebot.me',
};
export default config;
export { API_URL };
