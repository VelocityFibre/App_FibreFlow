import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { QueryClient } from '@tanstack/react-query'

export type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export interface SubscriptionConfig {
  table: string
  event?: SubscriptionEvent | '*'
  filter?: string
  schema?: string
}

export interface NotificationPayload {
  type: 'task_assignment' | 'phase_progression' | 'comment_added' | 'dependency_changed' | 'presence_update'
  entityId: string
  entityType: 'project' | 'phase' | 'step' | 'task' | 'comment'
  userId?: string
  data: any
  timestamp: string
}

export interface PresenceState {
  userId: string
  userName: string
  projectId?: string
  taskId?: string
  lastSeen: string
  status: 'online' | 'away' | 'offline'
}

class RealtimeSubscriptionManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private queryClient: QueryClient | null = null
  private presenceChannel: RealtimeChannel | null = null
  private currentUser: any = null
  private isReconnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private presenceState: Map<string, PresenceState> = new Map()

  constructor() {
    this.setupAuthListener()
  }

  setQueryClient(client: QueryClient) {
    this.queryClient = client
  }

  private setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null
      
      if (event === 'SIGNED_IN' && session?.user) {
        this.handleUserSignIn(session.user)
      } else if (event === 'SIGNED_OUT') {
        this.handleUserSignOut()
      }
    })
  }

  private async handleUserSignIn(user: any) {
    this.currentUser = user
    await this.setupPresenceTracking()
    this.reconnectAttempts = 0
  }

  private handleUserSignOut() {
    this.cleanup()
    this.currentUser = null
  }

  private async setupPresenceTracking() {
    if (!this.currentUser) return

    this.presenceChannel = supabase.channel('presence', {
      config: {
        presence: {
          key: this.currentUser.id,
        },
      },
    })

    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = this.presenceChannel?.presenceState()
        this.updatePresenceState(state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
        this.handlePresenceJoin(key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
        this.handlePresenceLeave(key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.presenceChannel?.track({
            userId: this.currentUser.id,
            userName: this.currentUser.user_metadata?.name || this.currentUser.email,
            status: 'online',
            lastSeen: new Date().toISOString(),
          })
        }
      })
  }

  private updatePresenceState(state: any) {
    this.presenceState.clear()
    
    Object.entries(state).forEach(([userId, presences]: [string, any]) => {
      const latestPresence = Array.isArray(presences) ? presences[0] : presences
      if (latestPresence) {
        this.presenceState.set(userId, {
          userId,
          userName: latestPresence.userName,
          projectId: latestPresence.projectId,
          taskId: latestPresence.taskId,
          lastSeen: latestPresence.lastSeen,
          status: latestPresence.status,
        })
      }
    })
  }

  private handlePresenceJoin(key: string, presences: any[]) {
    const presence = presences[0]
    if (presence) {
      this.presenceState.set(key, {
        userId: key,
        userName: presence.userName,
        projectId: presence.projectId,
        taskId: presence.taskId,
        lastSeen: presence.lastSeen,
        status: 'online',
      })
    }
  }

  private handlePresenceLeave(key: string, presences: any[]) {
    const current = this.presenceState.get(key)
    if (current) {
      this.presenceState.set(key, {
        ...current,
        status: 'offline',
        lastSeen: new Date().toISOString(),
      })
    }
  }

  async updatePresence(updates: Partial<PresenceState>) {
    if (!this.presenceChannel || !this.currentUser) return

    const currentPresence = this.presenceState.get(this.currentUser.id) || {}
    
    await this.presenceChannel.track({
      userId: this.currentUser.id,
      userName: this.currentUser.user_metadata?.name || this.currentUser.email,
      ...currentPresence,
      ...updates,
      lastSeen: new Date().toISOString(),
    })
  }

  getPresenceState(): PresenceState[] {
    return Array.from(this.presenceState.values())
  }

  getUsersInProject(projectId: string): PresenceState[] {
    return Array.from(this.presenceState.values())
      .filter(user => user.projectId === projectId && user.status === 'online')
  }

  getUsersOnTask(taskId: string): PresenceState[] {
    return Array.from(this.presenceState.values())
      .filter(user => user.taskId === taskId && user.status === 'online')
  }

  // Debounced update function to prevent excessive API calls
  private updateTimeouts: Map<string, NodeJS.Timeout> = new Map()
  
  private debounceInvalidation(queryKey: string[], delay = 1000) {
    if (!this.queryClient) return

    const key = JSON.stringify(queryKey)
    
    // Clear existing timeout
    const existingTimeout = this.updateTimeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.queryClient?.invalidateQueries({ queryKey })
      this.updateTimeouts.delete(key)
    }, delay)

    this.updateTimeouts.set(key, timeout)
  }

  private handleDatabaseChange(
    payload: RealtimePostgresChangesPayload<any>,
    channelName: string
  ) {
    console.log(`[${channelName}] Database change:`, payload)

    const { table, eventType, new: newRecord, old: oldRecord } = payload

    // Invalidate relevant React Query caches based on table and change
    switch (table) {
      case 'projects':
        this.debounceInvalidation(['projects'])
        if (newRecord?.id || oldRecord?.id) {
          const projectId = newRecord?.id || oldRecord?.id
          this.debounceInvalidation(['project', projectId])
          this.debounceInvalidation(['project-hierarchy', projectId])
        }
        break

      case 'project_phases':
        if (newRecord?.project_id || oldRecord?.project_id) {
          const projectId = newRecord?.project_id || oldRecord?.project_id
          this.debounceInvalidation(['project', projectId])
          this.debounceInvalidation(['project-hierarchy', projectId])
          this.debounceInvalidation(['phases', projectId])
        }
        break

      case 'project_steps':
        if (newRecord?.phase_id || oldRecord?.phase_id) {
          this.debounceInvalidation(['steps', newRecord?.phase_id || oldRecord?.phase_id])
          // Also invalidate project-level queries through phase relationship
          this.invalidateProjectFromPhase(newRecord?.phase_id || oldRecord?.phase_id)
        }
        break

      case 'project_tasks':
        if (newRecord?.step_id || oldRecord?.step_id) {
          this.debounceInvalidation(['tasks', newRecord?.step_id || oldRecord?.step_id])
          this.invalidateProjectFromStep(newRecord?.step_id || oldRecord?.step_id)
        }
        
        // Handle task assignment notifications
        if (eventType === 'UPDATE' && 
            newRecord?.assigned_to !== oldRecord?.assigned_to) {
          this.sendNotification({
            type: 'task_assignment',
            entityId: newRecord.id,
            entityType: 'task',
            userId: newRecord.assigned_to,
            data: {
              taskTitle: newRecord.title,
              assignedBy: this.currentUser?.id,
              previousAssignee: oldRecord?.assigned_to,
            },
            timestamp: new Date().toISOString(),
          })
        }
        break

      case 'comments':
        if (newRecord?.entity_id) {
          this.debounceInvalidation(['comments', newRecord.entity_type, newRecord.entity_id])
          
          this.sendNotification({
            type: 'comment_added',
            entityId: newRecord.entity_id,
            entityType: newRecord.entity_type,
            userId: newRecord.created_by,
            data: {
              comment: newRecord.content,
              authorName: newRecord.author_name,
            },
            timestamp: new Date().toISOString(),
          })
        }
        break
    }
  }

  private async invalidateProjectFromPhase(phaseId: string) {
    if (!this.queryClient) return
    
    try {
      const { data: phase } = await supabase
        .from('project_phases')
        .select('project_id')
        .eq('id', phaseId)
        .single()
      
      if (phase?.project_id) {
        this.debounceInvalidation(['project', phase.project_id])
        this.debounceInvalidation(['project-hierarchy', phase.project_id])
      }
    } catch (error) {
      console.error('Error invalidating project from phase:', error)
    }
  }

  private async invalidateProjectFromStep(stepId: string) {
    if (!this.queryClient) return
    
    try {
      const { data: step } = await supabase
        .from('project_steps')
        .select(`
          phase_id,
          project_phases!inner(project_id)
        `)
        .eq('id', stepId)
        .single()
      
      if (step?.project_phases?.project_id) {
        this.debounceInvalidation(['project', step.project_phases.project_id])
        this.debounceInvalidation(['project-hierarchy', step.project_phases.project_id])
      }
    } catch (error) {
      console.error('Error invalidating project from step:', error)
    }
  }

  private sendNotification(notification: NotificationPayload) {
    // In a real app, this would send to a notification service
    console.log('Notification sent:', notification)
    
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('fibreflow:notification', {
      detail: notification
    }))
  }

  // Subscribe to a specific table with optional filtering
  subscribeToTable(config: SubscriptionConfig, channelName?: string): string {
    const name = channelName || `${config.table}_${Date.now()}`
    
    if (this.channels.has(name)) {
      console.warn(`Channel ${name} already exists`)
      return name
    }

    const channel = supabase.channel(name)

    channel
      .on(
        'postgres_changes' as any,
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload) => this.handleDatabaseChange(payload, name)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${name}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to ${name}`)
          this.handleSubscriptionError(name)
        }
      })

    this.channels.set(name, channel)
    return name
  }

  // Subscribe to project-level updates (any change to project or its children)
  subscribeToProject(projectId: string): string {
    const channelName = `project_${projectId}`
    
    if (this.channels.has(channelName)) {
      return channelName
    }

    const channel = supabase.channel(channelName)

    // Subscribe to multiple tables related to the project
    channel
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`
      }, (payload) => this.handleDatabaseChange(payload, channelName))
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'project_phases',
        filter: `project_id=eq.${projectId}`
      }, (payload) => this.handleDatabaseChange(payload, channelName))
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'project_steps',
      }, (payload) => this.handleDatabaseChange(payload, channelName))
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'project_tasks',
      }, (payload) => this.handleDatabaseChange(payload, channelName))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to project ${projectId}`)
          // Update presence to show user is viewing this project
          this.updatePresence({ projectId })
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to project ${projectId}`)
          this.handleSubscriptionError(channelName)
        }
      })

    this.channels.set(channelName, channel)
    return channelName
  }

  // Subscribe to task assignment notifications for current user
  subscribeToUserTasks(userId: string): string {
    const channelName = `user_tasks_${userId}`
    
    if (this.channels.has(channelName)) {
      return channelName
    }

    return this.subscribeToTable({
      table: 'project_tasks',
      event: 'UPDATE',
      filter: `assigned_to=eq.${userId}`
    }, channelName)
  }

  private handleSubscriptionError(channelName: string) {
    if (this.isReconnecting) return

    this.isReconnecting = true
    this.reconnectAttempts++

    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${channelName}`)
      this.isReconnecting = false
      return
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000 // Exponential backoff
    console.log(`Attempting to reconnect ${channelName} in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.unsubscribe(channelName)
      // The component should re-subscribe automatically
      this.isReconnecting = false
    }, delay)
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
      console.log(`🔌 Unsubscribed from ${channelName}`)
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((_, channelName) => {
      this.unsubscribe(channelName)
    })
  }

  cleanup(): void {
    this.unsubscribeAll()
    
    if (this.presenceChannel) {
      supabase.removeChannel(this.presenceChannel)
      this.presenceChannel = null
    }

    // Clear all timeouts
    this.updateTimeouts.forEach(timeout => clearTimeout(timeout))
    this.updateTimeouts.clear()
    
    this.presenceState.clear()
  }

  // Get subscription status
  getSubscriptionStatus(): Record<string, string> {
    const status: Record<string, string> = {}
    
    this.channels.forEach((channel, name) => {
      status[name] = channel.state
    })
    
    if (this.presenceChannel) {
      status['presence'] = this.presenceChannel.state
    }
    
    return status
  }

  // Check if we're connected to real-time
  isConnected(): boolean {
    return Array.from(this.channels.values())
      .some(channel => channel.state === 'joined')
  }
}

// Singleton instance
export const realtimeManager = new RealtimeSubscriptionManager()

// Helper functions for easy access
export const subscribeToProject = (projectId: string) => 
  realtimeManager.subscribeToProject(projectId)

export const subscribeToUserTasks = (userId: string) => 
  realtimeManager.subscribeToUserTasks(userId)

export const subscribeToTable = (config: SubscriptionConfig) => 
  realtimeManager.subscribeToTable(config)

export const unsubscribe = (channelName: string) => 
  realtimeManager.unsubscribe(channelName)

export const updatePresence = (updates: Partial<PresenceState>) => 
  realtimeManager.updatePresence(updates)

export const getPresenceState = () => 
  realtimeManager.getPresenceState()

export const getUsersInProject = (projectId: string) => 
  realtimeManager.getUsersInProject(projectId)

export const getUsersOnTask = (taskId: string) => 
  realtimeManager.getUsersOnTask(taskId)