// frontend/src/components/Preloader.tsx
/**
 * Full-screen Preloader with curtain animation.
 * - Covers entire viewport with an opaque background while active (no content bleed-through).
 * - Curtains animate outward; when animation finishes it calls `onFinished`.
 * - Accessible and non-interactive while showing.
 */
import { useEffect, useState } from 'react'

interface PreloaderProps {
  onFinished: () => void
  // optional duration in ms to show the preloader before hiding
  visibleDuration?: number
}

const Preloader = ({ onFinished, visibleDuration = 3000 }: PreloaderProps) => {
  const [isHiding, setIsHiding] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      // start hide animation
      setIsHiding(true)
      // wait for animation to complete before calling onFinished
      const finishId = setTimeout(() => {
        onFinished()
      }, 1000) // match the CSS transition duration below
      return () => clearTimeout(finishId)
    }, visibleDuration)

    return () => clearTimeout(id)
  }, [onFinished, visibleDuration])

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
        <h1 className="text-2xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          "The only way to do great work is to love what you do."
        </h1>
        <div className="mt-6 flex justify-center">
          <div className="w-14 h-14 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}

export default Preloader