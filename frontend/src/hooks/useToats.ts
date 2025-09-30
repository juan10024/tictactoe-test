/*
 * file: use-toast.ts
 * hook: useToast
 * description:
 *     Minimalist custom hook for toast notifications.
 *     - Provides an interface for triggering toasts
 *     - Currently a mock implementation to avoid runtime errors
 *     - Designed to be replaced with a real implementation later
 *
 * usage:
 *     const { toast } = useToast()
 *     toast({ title: 'Hello', description: 'World' })
 */

import React from 'react'

/**
 * Mock hook for toast notifications.
 * Replace with a real stateful implementation (e.g. Zustand or context).
 */
export function useToast() {
  const [toasts] = React.useState<any[]>([])

  /**
   * Trigger a toast (mock).
   * @param options - toast content (title, description, etc.)
   */
  const toast = (options: any) => {
    console.log('Toast triggered:', options)
    // TODO: Add logic to store and render the toast
  }

  return { toasts, toast }
}
