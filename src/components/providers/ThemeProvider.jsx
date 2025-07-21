import { useEffect } from 'react';
import { useSelector } from 'react-redux';

function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.ui);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return children;
}

export default ThemeProvider;