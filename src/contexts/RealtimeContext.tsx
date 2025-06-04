'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { realtimeManager } from '../lib/realtimeSubscriptions'
import { 
  useNotifications, 
  usePresence, 
  useRealtimeStatus 
} from '../hooks/useRealtimeUpdates'
import { featureFlags } from '../lib/feature-flags'

interface RealtimeContextType {
  // Connection status
  isConnected: boolean
  connectionCount: number
  
  // Notifications
  notifications: any[]
  unreadCount: number
  markAsRead: (id?: string) => void
  clearNotifications: () => void
  
  // Presence
  presenceState: any[]
  updatePresenceLocation: (updates: any) => Promise<void>
  
  // Feature flag
  isRealtimeEnabled: boolean
  
  // Manual controls
  reconnect: () => void
  disconnect: () => void
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

interface RealtimeProviderProps {
  children: ReactNode
  enablePresence?: boolean
  enableNotifications?: boolean
}

export function RealtimeProvider({ 
  children, 
  enablePresence = true, 
  enableNotifications = true 
}: RealtimeProviderProps) {
  const queryClient = useQueryClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Feature flag check
  const isRealtimeEnabled = featureFlags.RealTimeNotifications

  // Hooks for real-time functionality
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    clearNotifications 
  } = useNotifications()
  
  const { 
    presenceState, 
    updatePresenceLocation 
  } = usePresence()
  
  const { 
    isConnected, 
    connectionCount 
  } = useRealtimeStatus()

  // Set up the query client in realtime manager
  useEffect(() => {
    if (isRealtimeEnabled) {
      realtimeManager.setQueryClient(queryClient)
    }
  }, [queryClient, isRealtimeEnabled])

  // Handle auth state changes
  useEffect(() => {
    if (!isRealtimeEnabled) {
      setIsInitialized(true)
      return
    }

    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          return
        }

        if (mounted) {
          setCurrentUser(session?.user || null)
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, session?.user?.id)
        setCurrentUser(session?.user || null)

        if (event === 'SIGNED_OUT') {
          // Clean up on sign out
          realtimeManager.cleanup()
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [isRealtimeEnabled])

  // Global error handling for real-time connections
  useEffect(() => {
    if (!isRealtimeEnabled || !isInitialized) return

    const handleGlobalError = (error: any) => {
      console.error('Global real-time error:', error)
      
      // Could implement user notification here
      // toast.error('Real-time connection error. Some features may not work properly.')
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentUser) {
        // Page became visible, ensure connections are active
        if (!isConnected) {
          console.log('Page visible, attempting to reconnect...')
          // Components will automatically re-subscribe via their useEffect hooks
        }
      }
    }

    // Listen for page visibility changes to handle reconnections
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Global error listener
    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleGlobalError)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleGlobalError)
    }
  }, [isRealtimeEnabled, isInitialized, currentUser, isConnected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRealtimeEnabled) {
        realtimeManager.cleanup()
      }
    }
  }, [isRealtimeEnabled])

  // Manual reconnection function
  const reconnect = async () => {
    if (!isRealtimeEnabled) return

    console.log('Manual reconnection triggered')
    realtimeManager.cleanup()
    
    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      // Force re-initialization by triggering auth state
      // Components will re-subscribe automatically
      window.location.reload() // As a fallback, but ideally components handle this
    }, 1000)
  }

  // Manual disconnection function
  const disconnect = () => {
    if (!isRealtimeEnabled) return

    console.log('Manual disconnection triggered')
    realtimeManager.cleanup()
  }

  // Context value
  const contextValue: RealtimeContextType = {
    // Connection status
    isConnected: isRealtimeEnabled ? isConnected : false,
    connectionCount: isRealtimeEnabled ? connectionCount : 0,
    
    // Notifications
    notifications: enableNotifications && isRealtimeEnabled ? notifications : [],
    unreadCount: enableNotifications && isRealtimeEnabled ? unreadCount : 0,
    markAsRead: enableNotifications && isRealtimeEnabled ? markAsRead : () => {},
    clearNotifications: enableNotifications && isRealtimeEnabled ? clearNotifications : () => {},
    
    // Presence
    presenceState: enablePresence && isRealtimeEnabled ? presenceState : [],
    updatePresenceLocation: enablePresence && isRealtimeEnabled ? updatePresenceLocation : async () => {},
    
    // Feature flag
    isRealtimeEnabled,
    
    // Manual controls
    reconnect,
    disconnect
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}

// Hook to use the realtime context
export function useRealtime(): RealtimeContextType {
  const context = useContext(RealtimeContext)
  
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  
  return context
}

// Optional: Hook with safe fallback for components that might not be wrapped in RealtimeProvider
export function useRealtimeSafe(): RealtimeContextType | null {
  const context = useContext(RealtimeContext)
  return context
}

// Connection status indicator component
export function RealtimeStatusIndicator({ className = '' }: { className?: string }) {
  const { isConnected, connectionCount, isRealtimeEnabled } = useRealtime()

  if (!isRealtimeEnabled) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <span className="text-xs">Real-time disabled</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></div>
      <span className="text-xs text-gray-600">
        {isConnected ? `Connected (${connectionCount})` : 'Disconnected'}
      </span>
    </div>
  )
}

// Notification badge component
export function NotificationBadge({ className = '' }: { className?: string }) {
  const { unreadCount, isRealtimeEnabled } = useRealtime()

  if (!isRealtimeEnabled || unreadCount === 0) {
    return null
  }

  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )
}

// Presence indicator component
interface PresenceIndicatorProps {
  projectId?: string
  taskId?: string
  className?: string
  showNames?: boolean
  maxShow?: number
}

export function PresenceIndicator({ 
  projectId, 
  taskId, 
  className = '', 
  showNames = false,
  maxShow = 3 
}: PresenceIndicatorProps) {
  const { presenceState, isRealtimeEnabled } = useRealtime()

  if (!isRealtimeEnabled) {
    return null
  }

  const relevantUsers = presenceState.filter(user => {
    if (taskId) {
      return user.taskId === taskId && user.status === 'online'
    }
    if (projectId) {
      return user.projectId === projectId && user.status === 'online'
    }
    return false
  })

  if (relevantUsers.length === 0) {
    return null
  }

  const displayUsers = relevantUsers.slice(0, maxShow)
  const remainingCount = relevantUsers.length - maxShow

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex -space-x-1">
        {displayUsers.map((user, index) => (
          <div
            key={user.userId}
            className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs text-white font-medium"
            title={showNames ? user.userName : 'User online'}
            style={{ zIndex: maxShow - index }}
          >
            {user.userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        ))}
      </div>
      
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          +{remainingCount}
        </span>
      )}
      
      {showNames && displayUsers.length === 1 && (
        <span className="text-xs text-gray-600 ml-1">
          {displayUsers[0].userName}
        </span>
      )}
    </div>
  )
}

export default RealtimeProvider