# Real-time Subscriptions Integration Guide

## Overview

This guide explains how to integrate the real-time subscription functionality into FibreFlow for collaborative features.

## Files Created

### Core Implementation
- `src/lib/realtimeSubscriptions.ts` - Core subscription logic with automatic reconnection
- `src/hooks/useRealtimeUpdates.ts` - React hooks for easy component integration
- `src/contexts/RealtimeContext.tsx` - Context provider for app-wide subscriptions

### Example Components
- `src/components/RealtimeProjectView.tsx` - Enhanced project view with real-time features
- `src/components/RealtimeTestComponents.tsx` - Test components for verification

## Quick Start

### 1. Add RealtimeProvider to Your App

Update your main layout file to include the RealtimeProvider:

```tsx
// src/app/layout.tsx
import RealtimeProvider from '@/contexts/RealtimeContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          <RealtimeProvider>
            {children}
          </RealtimeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

### 2. Use Real-time Hooks in Components

```tsx
// Example: Project page with real-time updates
import { useProjectRealtime } from '@/hooks/useRealtimeUpdates'

function ProjectPage({ projectId }: { projectId: string }) {
  const {
    isConnected,
    isProjectSubscribed,
    notifications,
    usersInProject,
    setActiveTask
  } = useProjectRealtime(projectId)

  return (
    <div>
      {isConnected && (
        <div className="bg-green-100 p-2 rounded">
          ⚡ Real-time updates active
        </div>
      )}
      
      {/* Show who else is viewing this project */}
      {usersInProject.length > 0 && (
        <div>
          {usersInProject.map(user => (
            <span key={user.userId}>{user.userName}</span>
          ))}
        </div>
      )}
      
      {/* Your project content */}
    </div>
  )
}
```

### 3. Add Real-time Components

```tsx
import { 
  RealtimeStatusIndicator, 
  PresenceIndicator, 
  NotificationBadge 
} from '@/contexts/RealtimeContext'

function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1>FibreFlow</h1>
      <div className="flex items-center gap-4">
        <NotificationBadge />
        <PresenceIndicator projectId="current-project" />
        <RealtimeStatusIndicator />
      </div>
    </header>
  )
}
```

## Key Features

### 1. Project-Level Subscriptions
Automatically subscribes to all changes within a project (phases, steps, tasks):

```tsx
const { isSubscribed } = useProjectSubscription(projectId)
```

### 2. Task Assignment Notifications
Real-time notifications when tasks are assigned to users:

```tsx
const { notifications } = useNotifications()
```

### 3. Presence Tracking
Shows who is currently viewing/editing what:

```tsx
const { usersInProject } = useProjectPresence(projectId)
const { usersOnTask } = useTaskPresence(taskId)
```

### 4. Collaborative Editing
Prevents conflicts when multiple users edit the same item:

```tsx
const { 
  otherUsers, 
  startEditing, 
  stopEditing 
} = useCollaborativeEditing('task', taskId)
```

## Subscription Channels

The system creates these subscription channels:

- `project_{id}` - All changes to a specific project
- `user_tasks_{userId}` - Task assignments for a specific user
- `presence` - User presence tracking
- Custom table subscriptions via `useTableSubscription`

## Performance Features

### Debounced Updates
React Query cache invalidation is debounced by 1 second to prevent excessive re-renders:

```typescript
// Multiple rapid changes trigger only one cache invalidation
task.assigned_to = 'user1'
task.status = 'completed'  
task.due_date = '2025-06-01'
// → Single cache refresh after 1 second
```

### Selective Subscriptions
Only subscribe to active projects to minimize overhead:

```tsx
// Only subscribes when projectId is provided
useProjectSubscription(currentProjectId) 
```

### Automatic Cleanup
Subscriptions are automatically cleaned up when:
- Component unmounts
- User navigates away
- User signs out
- Network disconnects

## Error Handling

### Automatic Reconnection
The system automatically reconnects with exponential backoff:

```typescript
// Reconnection attempts: 1s, 2s, 4s, 8s, 16s (max 5 attempts)
```

### Network Recovery
Detects when the page becomes visible again and reconnects:

```typescript
document.addEventListener('visibilitychange', handleReconnection)
```

### Graceful Degradation
Components work normally even when real-time features are disabled:

```tsx
// Feature flag check
if (!featureFlags.RealTimeNotifications) {
  // Falls back to polling or manual refresh
}
```

## Testing

### Test Dashboard
Access the test dashboard at `/test-realtime` to verify functionality:

```tsx
import { RealtimeTestDashboard } from '@/components/RealtimeTestComponents'

// Add this route to test real-time features
function TestPage() {
  return <RealtimeTestDashboard />
}
```

### Manual Testing Steps

1. **Presence Testing**:
   - Open project in multiple tabs
   - Verify user avatars appear
   - Test task editing indicators

2. **Notification Testing**:
   - Assign tasks between users
   - Check notification badges
   - Verify notification content

3. **Database Change Testing**:
   - Make changes in one tab
   - Verify updates appear in other tabs
   - Check React Query cache invalidation

4. **Connection Testing**:
   - Disconnect internet
   - Verify reconnection attempts
   - Check graceful degradation

## Troubleshooting

### Common Issues

#### Subscriptions Not Working
```bash
# Check if feature flag is enabled
console.log(featureFlags.RealTimeNotifications) // should be true

# Check Supabase real-time settings
# Ensure Row Level Security allows real-time subscriptions
```

#### Presence Not Updating
```bash
# Check authentication
console.log(supabase.auth.getUser()) // should return user

# Check presence channel subscription
console.log(realtimeManager.getSubscriptionStatus())
```

#### Performance Issues
```bash
# Check number of active subscriptions
console.log(realtimeManager.getSubscriptionStatus())

# Should not exceed 5-10 active subscriptions per user
```

### Debug Mode
Enable debug logging:

```typescript
// Add to localStorage
localStorage.setItem('fibreflow:debug', 'true')

// Check browser console for detailed logs
```

## Security Considerations

### Row Level Security
Ensure Supabase RLS policies allow real-time subscriptions:

```sql
-- Allow users to subscribe to projects they have access to
CREATE POLICY "Users can subscribe to accessible projects" ON projects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_access 
    WHERE project_id = projects.id 
    AND user_id = auth.uid()
  )
);
```

### Data Filtering
Subscriptions respect existing access controls:

```typescript
// Subscriptions only receive data the user can already access
// No additional data is exposed through real-time channels
```

## Production Deployment

### Environment Variables
Required Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Feature Flags
Control real-time features with feature flags:

```typescript
// src/lib/feature-flags.ts
export const featureFlags = {
  RealTimeNotifications: process.env.NODE_ENV === 'production' ? true : true
}
```

### Monitoring
Monitor real-time usage:

```typescript
// Add metrics tracking
realtimeManager.on('subscription', (event) => {
  analytics.track('realtime_subscription', event)
})
```

## Migration Guide

### From Static to Real-time

1. **Phase 1**: Add RealtimeProvider to layout
2. **Phase 2**: Replace project pages with real-time versions
3. **Phase 3**: Add presence indicators to key components
4. **Phase 4**: Enable notifications across the app

### Backwards Compatibility
The implementation is designed to be backwards compatible:

- Existing components work without changes
- Real-time features are additive
- Feature flags allow gradual rollout

## Future Enhancements

### Planned Features
- Voice/video calling integration
- Real-time document editing
- Advanced conflict resolution
- Mobile app support
- Analytics dashboard

### Extensibility
The system is designed to be extensible:

```typescript
// Add new subscription types
realtimeManager.subscribeToTable({
  table: 'new_entity',
  filter: 'user_id=eq.123'
})

// Add new notification types
sendNotification({
  type: 'custom_event',
  entityId: 'entity-123',
  data: customData
})
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console logs
3. Test with the RealtimeTestDashboard
4. Contact the development team

---

This implementation provides a solid foundation for real-time collaboration in FibreFlow while maintaining performance and reliability.