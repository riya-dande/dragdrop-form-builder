const localApiBaseUrl = 'http://localhost:3000';
const productionApiBaseUrl = 'https://dragdrop-backend-ies3.onrender.com';

function isProductionFrontend() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.hostname.endsWith('.netlify.app');
}

export function getApiBaseUrl() {
  return isProductionFrontend() ? productionApiBaseUrl : localApiBaseUrl;
}
