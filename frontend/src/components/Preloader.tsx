/**
 * Full-screen Preloader with typewriter effect and curtain animation.
 * - Shows quote letter by letter, then reveals content with curtain animation
 * - Accessible and non-interactive while showing.
 */
import { useEffect, useState } from 'react'

interface PreloaderProps {
  onFinished: () => void
  // optional duration in ms to show the preloader before hiding
  visibleDuration?: number
}

const Preloader = ({ onFinished }: PreloaderProps) => {
  const [isTyping, setIsTyping] = useState(true)
  const [displayText, setDisplayText] = useState('')
  const [isHiding, setIsHiding] = useState(false)
  
  const quote = '"The only way to do great work is to love what you do."'
  const author = 'Steve Jobs'

  useEffect(() => {
    // Typewriter effect
    let index = 0
    const typingInterval = setInterval(() => {
      if (index < quote.length) {
        setDisplayText(quote.slice(0, index + 1))
        index++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)
        
        // Wait a bit after typing is complete, then start curtain animation
        const curtainTimeout = setTimeout(() => {
          setIsHiding(true)
          // Wait for animation to complete before calling onFinished
          const finishTimeout = setTimeout(() => {
            onFinished()
          }, 1000) // match the CSS transition duration
          return () => clearTimeout(finishTimeout)
        }, 1000) // wait 1 second after typing completes
        
        return () => clearTimeout(curtainTimeout)
      }
    }, 50) // typing speed: 50ms per character

    return () => {
      clearInterval(typingInterval)
    }
  }, [onFinished, quote])

  return (
    // Fixed overlay that fully covers the app and prevents interactions underneath
    <div
      aria-hidden={isHiding}
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${
        isHiding ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Solid overlay background that fades out when hiding */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isHiding ? 'opacity-0' : 'opacity-100'
        } bg-white dark:bg-gray-900`}
      />
      
      {/* Curtains (left + right) animate to reveal the content */}
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
      
      {/* Center content */}
      <div
        className={`relative z-10 px-6 text-center max-w-3xl transition-opacity duration-700 ${
          isHiding ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <h1 className="text-2xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
          {displayText}
          {isTyping && <span className="ml-1 inline-block w-1 h-8 bg-current align-bottom animate-pulse"></span>}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium">
          {author}
        </p>
      </div>
    </div>
  )
}

export default Preloader;