import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop automatically resets the window scroll position to the top (0, 0)
 * on every route transition. This prevents pages (e.g. Privacy Policy, Terms & Conditions)
 * from opening at the bottom of the viewport when clicked from the footer, ensuring
 * the page opens completely from the top without requiring the user to scroll up.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetElement = document.getElementById(hash.replace('#', ''));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Instantly scroll to the absolute top of the page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;

