# Step 4: Copy Soft Delete System

## What you're copying:
Complete soft delete functionality - never permanently delete data, just archive it.

## Files to copy:
```
lib/softDelete.ts              - Core soft delete utilities and functions
hooks/useSoftDelete.ts         - React hooks for soft delete operations  
components/ArchivedItemsManager.tsx - UI for managing archived items
migrations/add-soft-delete-columns.sql - Database migration for soft delete
```

## Copy commands:
```bash
# Navigate to your original project
cd /home/ldp/louisdup/Clients/VelocityFibre/App/FibreFlow/project-management-app/FibreFlow/

# Copy the lib file
cp /home/ldp/louisdup/Clients/VelocityFibre/App/Hein/App_FibreFlow/step4-soft-delete/lib/softDelete.ts src/lib/

# Copy the hook
cp /home/ldp/louisdup/Clients/VelocityFibre/App/Hein/App_FibreFlow/step4-soft-delete/hooks/useSoftDelete.ts src/hooks/

# Copy the component
cp /home/ldp/louisdup/Clients/VelocityFibre/App/Hein/App_FibreFlow/step4-soft-delete/components/ArchivedItemsManager.tsx src/components/

# Copy the migration (create supabase directory if needed)
mkdir -p supabase/migrations
cp /home/ldp/louisdup/Clients/VelocityFibre/App/Hein/App_FibreFlow/step4-soft-delete/migrations/add-soft-delete-columns.sql supabase/migrations/
```

## What this system provides:

### softDelete.ts (Core Library)
- `softDeleteRecord()` - Archives a record instead of deleting
- `restoreRecord()` - Unarchives a record  
- `permanentlyDelete()` - Actually delete (admin only)
- `getArchivedRecords()` - Fetch archived items
- Bulk operations with safety limits
- Audit trail integration

### useSoftDelete.ts (React Hook)
- `useSoftDelete()` hook for components
- Loading states and error handling
- Optimistic updates for better UX
- Integration with React Query

### ArchivedItemsManager.tsx (UI Component)
- View all archived items
- Restore individual items or bulk restore
- Search and filter archived items
- Admin interface for permanent deletion

### add-soft-delete-columns.sql (Database)
- Adds `deleted_at` column to tables
- Adds `deleted_by` column for audit trail
- Updates existing queries to exclude deleted items

## Benefits:
- **Data Safety**: Never lose important data
- **Compliance**: Meet data retention requirements  
- **User Experience**: "Undo" delete operations
- **Audit Trail**: Track who deleted what and when
- **Admin Control**: Permanent deletion requires admin access

## Database Migration:
**IMPORTANT**: Run the SQL migration on your database:
```sql
-- You'll need to run the migration file on your Supabase database
-- The file adds deleted_at and deleted_by columns to your tables
```

## Testing:
After copying, your app should work normally. The soft delete functionality will be available but won't automatically change existing delete behavior until you integrate it.

## Integration Example:
```tsx
import { useSoftDelete } from '@/hooks/useSoftDelete'

function MyComponent() {
  const { softDelete, restore, isLoading } = useSoftDelete('projects')
  
  const handleDelete = (id: string) => {
    softDelete(id) // Archives instead of permanent delete
  }
  
  return (
    <button onClick={() => handleDelete('123')} disabled={isLoading}>
      Archive Project
    </button>
  )
}
```

## Next step:
Once copied and tested, we'll move to Step 5 (Real-time Collaboration System).