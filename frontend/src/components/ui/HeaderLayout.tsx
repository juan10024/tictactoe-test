/*
 * file: HeaderLayout.tsx
 * component: HeaderLayout
 * description:
 *     Provides a common layout structure with a header, logo, theme toggle, 
 *     and main content area. Wraps child components within this layout.
 */

import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../hooks/useTheme';
import logo from '../../assets/logo.png';

interface HeaderLayoutProps {
  children: React.ReactNode;
}

const HeaderLayout = ({ children }: HeaderLayoutProps) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-400 shadow-md py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="h-12 object-contain"
            />
          </div>
          
          {/* Center: Author name */}
          <div className="flex-grow flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-100">
              By: Juan Daniel Valderrama
            </p>
          </div>
          
          {/* Right: Theme toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main content container */}
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
};

export default HeaderLayout;
