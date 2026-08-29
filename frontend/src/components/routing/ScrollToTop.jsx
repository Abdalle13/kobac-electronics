import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls the window to the top whenever the route path changes,
// so navigating (e.g. from a footer link) never lands mid-page.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
