# Soft Delete Utilities for FibreFlow

This document outlines the implementation of soft delete functionality in the FibreFlow project management application. This feature follows the project requirement to never delete records but instead use soft delete with an `archived_at` timestamp.

## Database Migration

The implementation includes a database migration that adds an `archived_at` timestamp column to all tables in the database. This column is used to mark records as archived (soft deleted) instead of permanently removing them from the database.

Migration file: `/supabase/migrations/add-soft-delete-columns.sql`

```sql
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Similar alterations for all other tables
-- ...

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_archived_at ON projects(archived_at) WHERE archived_at IS NOT NULL;
-- ...
```

## Core Utilities

### Soft Delete Library (`/src/lib/softDelete.ts`)

The core functionality is implemented in the `softDelete.ts` library, which provides:

1. **Archive/Unarchive Functions**: Methods to mark records as archived or restore them
2. **Query Filters**: Utility functions to exclude or include archived records in queries
3. **Bulk Operations**: Support for archiving multiple records at once with safety limits

Key functions:

- `archiveRecord(table, id, details?)`: Archives a record by setting its `archived_at` timestamp
- `unarchiveRecord(table, id, details?)`: Restores a record by clearing its `archived_at` timestamp
- `excludeArchived(query)`: Modifies a query to filter out archived records
- `onlyArchived(query)`: Modifies a query to only include archived records
- `includeArchived(query)`: Passes through the query without archive filtering
- `bulkArchiveRecords(table, ids, details?)`: Archives multiple records at once

### Query Utilities (`/src/lib/queryUtils.ts`)

Standard query patterns that incorporate soft delete functionality:

- `createStandardQuery(table, columns, includeArchived)`: Creates a base query that excludes archived records by default
- `fetchById(table, id, columns, includeArchived)`: Fetches a single record with archive filtering
- `fetchAll(table, columns, options)`: Fetches multiple records with archive filtering and additional options
- `updateRecord(table, id, updates)`: Updates a record with standard error handling
- `createRecord(table, record)`: Creates a new record with timestamps

## React Hooks

### Soft Delete Hook (`/src/hooks/useSoftDelete.ts`)

A React hook that provides a consistent interface for archive operations:

```typescript
const { archive, unarchive, bulkArchive, loading, error } = useSoftDelete();

// Example usage
await archive('projects', projectId, {
  details: { projectName: 'Example Project' },
  invalidateQueries: ['projects']
});
```

### Updated Data Hooks

Existing data hooks have been updated to incorporate soft delete functionality:

- `useProjects(limit?, includeArchived?)`: Now accepts an `includeArchived` parameter to control whether archived projects are included

## UI Components

### Archived Items Manager (`/src/components/ArchivedItemsManager.tsx`)

A reusable component for displaying and managing archived items:

```jsx
<ArchivedItemsManager
  table="new_customers"
  items={archivedCustomers}
  nameField="name"
  onItemRestored={handleItemRestored}
  refreshData={fetchCustomers}
  queryKeysToInvalidate={['customers']}
/>
```

## Integration with Audit Logging

All archive and unarchive operations are automatically logged in the audit trail system:

- Archive operations are logged with action type `DELETE`
- Unarchive operations are logged with action type `UPDATE`
- Details about the operation are included in the audit log

## Usage Guidelines

### Querying Data

Always use the query utilities or soft delete filters when querying data:

```typescript
// Using the query utilities
const projects = await fetchAll('projects');

// Using the soft delete filters directly
const { data } = await supabase
  .from('projects')
  .select('*')
  .then(excludeArchived);
```

### Deleting Records

Never use the `.delete()` method on Supabase queries. Instead, use the soft delete utilities:

```typescript
// DON'T do this
await supabase.from('projects').delete().eq('id', projectId);

// DO this instead
await archiveRecord('projects', projectId);
```

### Viewing Archived Records

The UI should provide options for users to view archived records when appropriate:

```typescript
// Toggle to show/hide archived records
const [showArchived, setShowArchived] = useState(false);

// Fetch data based on the toggle
useEffect(() => {
  fetchData(showArchived);
}, [showArchived]);
```

## Compliance with Project Rules

This implementation adheres to the following project rules:

- Rule #23: NEVER delete records - use soft delete with `archived_at` timestamp
- Rule #24: ALWAYS include `created_at` and `updated_at` timestamps on new tables
- Rule #38: ALWAYS require confirmation for bulk operations affecting > 100 items
- Rule #43: ALWAYS provide user-friendly error messages

## Future Enhancements

Potential future enhancements to the soft delete system:

1. Automated cleanup of long-archived records (e.g., moving to cold storage after 1 year)
2. More sophisticated restoration logic for related records
3. Enhanced permissions for viewing and managing archived records
