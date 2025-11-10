import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import '../style/theme-toggle.css';

type Theme = 'dark' | 'light';

interface ThemeSwitcherProps {
  value?: Theme;
  onChange?: (value: Theme) => void;
  defaultValue?: Theme;
  className?: string;
}

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = 'dark',
  className,
}: ThemeSwitcherProps) => {
  const [theme, setTheme] = useControllableState({
    defaultProp: defaultValue,
    prop: value,
    onChange,
  });

  return (
    <div className={cn('theme-switcher-horizontal', className)}>
      <button
        className={cn('theme-button', theme === 'light' && 'active')}
        onClick={() => setTheme('light')}
        aria-label="Switch to light theme"
      >
        {theme === 'light' && (
          <motion.div
            layoutId="active-theme"
            className="theme-button-bg"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <Sun className="theme-icon" size={14} />
      </button>

      <button
        className={cn('theme-button', theme === 'dark' && 'active')}
        onClick={() => setTheme('dark')}
        aria-label="Switch to dark theme"
      >
        {theme === 'dark' && (
          <motion.div
            layoutId="active-theme"
            className="theme-button-bg"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <Moon className="theme-icon" size={14} />
      </button>
    </div>
  );
};

// Default export that integrates with ThemeContext
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeSwitcher
      value={theme}
      onChange={setTheme}
    />
  );
};

export default ThemeToggle;
