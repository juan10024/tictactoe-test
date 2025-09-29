// frontend/src/components/layout/HeaderLayout.tsx
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../hooks/useTheme';
import logo from '../../assets/logo.png'; // Importa la imagen

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
          {/* Logo a la izquierda */}
          <div className="flex-shrink-0">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="h-12 object-contain" // Ajusta la altura según necesites
            />
          </div>
          
          {/* Nombre centrado */}
          <div className="flex-grow flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-100">
              By: Juan Daniel Valderrama
            </p>
          </div>
          
          {/* Icono de tema a la derecha */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
};

export default HeaderLayout;