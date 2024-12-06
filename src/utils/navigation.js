import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useNavigationGuard() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle initial navigation
    if (location.pathname === '/') {
      navigate('/app/dashboard');
    }
  }, [location, navigate]);
}

export function updateUrlParams(params, replace = false) {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
}
