/*
 * file: Preloader.tsx
 * component: Preloader
 * description:
 *     Full-screen preloader with typewriter effect and curtain animation.
 *     - Displays a quote character by character
 *     - Then performs a curtain reveal animation
 *     - Accessible, blocks interactions while visible
 */

import { useEffect, useState } from 'react';

interface PreloaderProps {
  onFinished: () => void;
  /** Optional duration in ms before hiding the preloader */
  visibleDuration?: number;
}

const Preloader = ({ onFinished }: PreloaderProps) => {
  const [isTyping, setIsTyping] = useState(true);
  const [displayText, setDisplayText] = useState('');
  const [isHiding, setIsHiding] = useState(false);

  const quote = '"The only way to do great work is to love what you do."';
  const author = 'Steve Jobs';

  useEffect(() => {
    let index = 0;

    // Typewriter effect
    const typingInterval = setInterval(() => {
      if (index < quote.length) {
        setDisplayText(quote.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);

        // After typing finishes, start curtain animation
        const curtainTimeout = setTimeout(() => {
          setIsHiding(true);

          // Wait for curtain animation to complete
          const finishTimeout = setTimeout(() => {
            onFinished();
          }, 1000); 

          return () => clearTimeout(finishTimeout);
        }, 1000); 

        return () => clearTimeout(curtainTimeout);
      }
    }, 50); 

    return () => {
      clearInterval(typingInterval);
    };
  }, [onFinished, quote]);

  return (
    <div
      aria-hidden={isHiding}
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${
        isHiding ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Background overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isHiding ? 'opacity-0' : 'opacity-100'
        } bg-white dark:bg-gray-900`}
      />

      {/* Curtains */}
      <div
        className={`absolute top-0 left-0 h-full w-1/2 bg-gray-800 transform transition-transform duration-1000 ease-in-out ${
          isHiding ? '-translate-x-full' : 'translate-x-0'
        }`}
      />
      <div
        className={`absolute top-0 right-0 h-full w-1/2 bg-gray-800 transform transition-transform duration-1000 ease-in-out ${
          isHiding ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Quote and author */}
      <div
        className={`relative z-10 px-6 text-center max-w-3xl transition-opacity duration-700 ${
          isHiding ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <h1 className="text-2xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
          {displayText}
          {isTyping && (
            <span className="ml-1 inline-block w-1 h-8 bg-current align-bottom animate-pulse"></span>
          )}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium">
          {author}
        </p>
      </div>
    </div>
  );
};

export default Preloader;
