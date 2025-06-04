import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { 
  realtimeManager, 
  SubscriptionConfig, 
  NotificationPayload, 
  PresenceState,
  subscribeToProject,
  subscribeToUserTasks,
  updatePresence,
  getPresenceState,
  getUsersInProject,
  getUsersOnTask,
  unsubscribe
} from '../lib/realtimeSubscriptions'

// Hook for subscribing to project-level real-time updates
export function useProjectSubscription(projectId: string | undefined | null) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const channelRef = useRef<string | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!projectId) {
      if (channelRef.current) {
        unsubscribe(channelRef.current)
        channelRef.current = null
        setIsSubscribed(false)
      }
      return
    }

    // Set up the query client in the realtime manager
    realtimeManager.setQueryClient(queryClient)

    // Subscribe to project updates
    const channelName = subscribeToProject(projectId)
    channelRef.current = channelName
    setIsSubscribed(true)

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current)
        channelRef.current = null
        setIsSubscribed(false)
      }
    }
  }, [projectId, queryClient])

  return { isSubscribed }
}

// Hook for subscribing to user's task assignments
export function useUserTaskSubscription(userId: string | undefined | null) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const channelRef = useRef<string | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) {
      if (channelRef.current) {
        unsubscribe(channelRef.current)
        channelRef.current = null
        setIsSubscribed(false)
      }
      return
    }

    realtimeManager.setQueryClient(queryClient)

    const channelName = subscribeToUserTasks(userId)
    channelRef.current = channelName
    setIsSubscribed(true)

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current)
        channelRef.current = null
        setIsSubscribed(false)
      }
    }
  }, [userId, queryClient])

  return { isSubscribed }
}

// Hook for custom table subscriptions
export function useTableSubscription(config: SubscriptionConfig | null) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const channelRef = useRef<string | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!config) {
      if (channelRef.current) {
        unsubscribe(channelRef.current)
        channelRef.current = null
        setIsSubscribed(false)
      }
      return
    }

    realtimeManager.setQueryClient(queryClient)

    const channelName = realtimeManager.subscribeToTable(config)
    channelRef.current = channelName
    setIsSubscribed(true)

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current)
        channelRef.current = null
        setIsSubscribed(false)
      }
    }
  }, [config?.table, config?.event, config?.filter, queryClient])

  return { isSubscribed }
}

// Hook for listening to notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const markAsRead = useCallback((notificationId?: string) => {
    if (notificationId) {
      setNotifications(prev => 
        prev.map(n => 
          n.timestamp === notificationId ? { ...n, read: true } : n
        )
      )
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    const handleNotification = (event: CustomEvent<NotificationPayload>) => {
      const notification = { ...event.detail, read: false }
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
      setUnreadCount(prev => prev + 1)
    }

    window.addEventListener('fibreflow:notification', handleNotification as EventListener)

    return () => {
      window.removeEventListener('fibreflow:notification', handleNotification as EventListener)
    }
  }, [])

  return {
    notifications,
    unreadCount,
    clearNotifications,
    markAsRead
  }
}

// Hook for presence tracking
export function usePresence() {
  const [presenceState, setPresenceState] = useState<PresenceState[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const updatePresenceLocation = useCallback(async (updates: Partial<PresenceState>) => {
    await updatePresence(updates)
  }, [])

  const refreshPresence = useCallback(() => {
    const state = getPresenceState()
    setPresenceState(state)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Initial load
    refreshPresence()

    // Set up periodic refresh for presence state
    const interval = setInterval(refreshPresence, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [refreshPresence])

  return {
    presenceState,
    isLoading,
    updatePresenceLocation,
    refreshPresence
  }
}

// Hook for project-specific presence
export function useProjectPresence(projectId: string | undefined | null) {
  const [usersInProject, setUsersInProject] = useState<PresenceState[]>([])
  
  useEffect(() => {
    if (!projectId) {
      setUsersInProject([])
      return
    }

    const updateUsers = () => {
      const users = getUsersInProject(projectId)
      setUsersInProject(users)
    }

    // Initial load
    updateUsers()

    // Set up periodic refresh
    const interval = setInterval(updateUsers, 3000)

    return () => clearInterval(interval)
  }, [projectId])

  return { usersInProject }
}

// Hook for task-specific presence
export function useTaskPresence(taskId: string | undefined | null) {
  const [usersOnTask, setUsersOnTask] = useState<PresenceState[]>([])
  
  useEffect(() => {
    if (!taskId) {
      setUsersOnTask([])
      return
    }

    const updateUsers = () => {
      const users = getUsersOnTask(taskId)
      setUsersOnTask(users)
    }

    // Initial load
    updateUsers()

    // Set up periodic refresh
    const interval = setInterval(updateUsers, 2000)

    return () => clearInterval(interval)
  }, [taskId])

  return { usersOnTask }
}

// Hook for connection status monitoring
export function useRealtimeStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [subscriptions, setSubscriptions] = useState<Record<string, string>>({})

  useEffect(() => {
    const checkStatus = () => {
      setIsConnected(realtimeManager.isConnected())
      setSubscriptions(realtimeManager.getSubscriptionStatus())
    }

    // Initial check
    checkStatus()

    // Periodic status check
    const interval = setInterval(checkStatus, 2000)

    return () => clearInterval(interval)
  }, [])

  return {
    isConnected,
    subscriptions,
    connectionCount: Object.keys(subscriptions).length
  }
}

// Combined hook for full real-time functionality in a project context
export function useProjectRealtime(projectId: string | undefined | null, userId?: string) {
  const { isSubscribed: projectSubscribed } = useProjectSubscription(projectId)
  const { isSubscribed: taskSubscribed } = useUserTaskSubscription(userId)
  const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications()
  const { usersInProject } = useProjectPresence(projectId)
  const { isConnected, connectionCount } = useRealtimeStatus()
  const { updatePresenceLocation } = usePresence()

  // Auto-update presence when project changes
  useEffect(() => {
    if (projectId) {
      updatePresenceLocation({ projectId, taskId: undefined })
    }
  }, [projectId, updatePresenceLocation])

  const setActiveTask = useCallback((taskId: string | undefined) => {
    updatePresenceLocation({ taskId })
  }, [updatePresenceLocation])

  return {
    // Subscription status
    isConnected,
    isProjectSubscribed: projectSubscribed,
    isTaskSubscribed: taskSubscribed,
    connectionCount,
    
    // Notifications
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    
    // Presence
    usersInProject,
    setActiveTask,
    
    // Quick project-specific notifications
    projectNotifications: notifications.filter(n => 
      n.entityType === 'project' || 
      (projectId && n.data?.projectId === projectId)
    )
  }
}

// Hook specifically for collaborative editing scenarios
export function useCollaborativeEditing(
  entityType: 'project' | 'task' | 'phase' | 'step',
  entityId: string | undefined | null
) {
  const [otherUsers, setOtherUsers] = useState<PresenceState[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const { updatePresenceLocation } = usePresence()

  // Track editing state
  const startEditing = useCallback(() => {
    setIsEditing(true)
    if (entityType === 'task' && entityId) {
      updatePresenceLocation({ taskId: entityId })
    }
  }, [entityType, entityId, updatePresenceLocation])

  const stopEditing = useCallback(() => {
    setIsEditing(false)
    if (entityType === 'task') {
      updatePresenceLocation({ taskId: undefined })
    }
  }, [entityType, updatePresenceLocation])

  // Update other users based on entity type
  useEffect(() => {
    if (!entityId) {
      setOtherUsers([])
      return
    }

    const updateOtherUsers = () => {
      if (entityType === 'task') {
        const users = getUsersOnTask(entityId)
        setOtherUsers(users.filter(u => u.userId !== getCurrentUserId()))
      }
      // Could extend for project-level editing, etc.
    }

    updateOtherUsers()
    const interval = setInterval(updateOtherUsers, 2000)

    return () => clearInterval(interval)
  }, [entityType, entityId])

  return {
    otherUsers,
    isEditing,
    startEditing,
    stopEditing,
    hasOtherEditors: otherUsers.length > 0
  }
}

// Helper to get current user ID (you might want to implement this differently)
function getCurrentUserId(): string | undefined {
  // This should be implemented based on your auth context
  return realtimeManager['currentUser']?.id
}