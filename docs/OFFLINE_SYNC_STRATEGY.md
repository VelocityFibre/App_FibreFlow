# FibreFlow Offline Sync Strategy

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Data Storage Approach](#data-storage-approach)
4. [Sync Queue Design](#sync-queue-design)
5. [Conflict Resolution Strategy](#conflict-resolution-strategy)
6. [Sync Error Handling](#sync-error-handling)
7. [Data Consistency](#data-consistency)
8. [Bandwidth Optimization](#bandwidth-optimization)
9. [Implementation Plan](#implementation-plan)
10. [Testing Strategy](#testing-strategy)

## Introduction

This document outlines the comprehensive offline sync strategy for the FibreFlow application, addressing the specific needs of field workers who often operate in areas with poor or no connectivity. The strategy ensures that field workers can access project data, update task status, and log work progress without requiring a constant internet connection.

### Objectives
- Enable field workers to perform critical operations offline
- Ensure data integrity during synchronization
- Minimize data loss and conflicts
- Optimize bandwidth usage for mobile connections
- Provide transparent user experience during online/offline transitions

### Key Requirements
- Support for the complete Projects → Phases → Steps → Tasks hierarchy
- Prioritized sync for critical data (task status updates, time logs)
- Efficient handling of large file attachments
- Partial sync capabilities for large projects
- Robust conflict resolution

## System Architecture

### High-Level Architecture

```
┌─────────────────────┐      ┌─────────────────────┐
│                     │      │                     │
│  Client Application │◄────►│  Supabase Backend   │
│                     │      │                     │
└─────────┬───────────┘      └─────────────────────┘
          │
          │ Offline
          ▼
┌─────────────────────┐
│                     │
│  IndexedDB Storage  │
│                     │
└─────────────────────┘
```

### Components

1. **Online Mode Components**
   - React Query for server state management
   - Supabase client for real-time data
   - Optimistic UI updates

2. **Offline Mode Components**
   - IndexedDB for local data storage
   - Sync queue manager for mutation tracking
   - Conflict detection and resolution system
   - Background sync service

3. **Shared Components**
   - Connection status monitor
   - Sync status indicators
   - Feature flag integration for gradual rollout
   - Audit logging for tracking changes

## Data Storage Approach

### IndexedDB Schema

The local database schema mirrors the Supabase database structure with additional metadata for sync status tracking:

```typescript
// Database Structure
interface OfflineDatabase {
  // Core data tables
  projects: Table<Project & SyncMetadata>;
  phases: Table<Phase & SyncMetadata>;
  steps: Table<Step & SyncMetadata>;
  tasks: Table<Task & SyncMetadata>;
  
  // Reference data (mostly read-only)
  customers: Table<Customer>;
  staff: Table<Staff>;
  locations: Table<Location>;
  
  // Sync management
  syncQueue: Table<QueuedMutation>;
  syncLogs: Table<SyncLog>;
  
  // File attachments
  fileQueue: Table<QueuedFile>;
}

// Sync metadata added to each record
interface SyncMetadata {
  _syncStatus: 'synced' | 'modified' | 'pending_upload' | 'conflict';
  _localUpdatedAt: number; // timestamp
  _serverUpdatedAt: number | null; // timestamp
  _syncId: string; // unique ID for tracking sync operations
  _isDeleted: boolean; // for soft deletes
}

// Queue entry for pending mutations
interface QueuedMutation {
  id: string;
  table: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  attempts: number;
  lastAttempt: number | null;
  error: string | null;
  dependencies: string[]; // IDs of mutations this depends on
}

// File queue for handling attachments
interface QueuedFile {
  id: string;
  relatedTable: string;
  relatedRecordId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  localUri: string;
  uploadStatus: 'pending' | 'in_progress' | 'failed';
  uploadProgress: number;
  priority: 'high' | 'medium' | 'low';
}
```

### Data Caching Strategy

1. **Essential Data Preloading**
   - Active projects and their complete hierarchy are preloaded when online
   - Reference data (customers, staff, locations) is cached with longer expiration
   - Task templates and standard procedures are preloaded for offline creation

2. **Partial Data Loading**
   - For large projects (>100 tasks), implement partial loading with pagination
   - Cache most recently accessed and modified data with higher priority
   - Implement LRU (Least Recently Used) cache eviction policy

3. **Data Expiration Policy**
   - Project data: 7 days
   - Reference data: 30 days
   - Completed tasks: 3 days
   - Attachments: Based on available storage (with user control)

## Sync Queue Design

### Queue Structure and Prioritization

The sync queue manages all pending changes made while offline, with a sophisticated prioritization system:

1. **Priority Levels**
   - **High**: Task status updates, time logs, critical field reports
   - **Medium**: Task creation/modification, step updates, comments
   - **Low**: Project metadata updates, non-critical attachments

2. **Queue Processing Rules**
   - Process high priority items first
   - Process items in chronological order within the same priority
   - Respect dependencies between mutations
   - Implement exponential backoff for failed sync attempts

### Sync Process Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Detect Online  │────►│ Process Queue   │────►│ Update Local DB │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Notify User    │◄────┤ Handle Conflicts│◄────┤ Receive Server  │
│                 │     │                 │     │ Response        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Implementation

```typescript
export class SyncQueueManager {
  private db: OfflineDatabase;
  private isProcessing: boolean = false;
  private networkMonitor: NetworkMonitor;
  private conflictResolver: ConflictResolver;
  
  constructor() {
    this.db = openDatabase();
    this.networkMonitor = new NetworkMonitor();
    this.conflictResolver = new ConflictResolver(this.db);
    
    // Listen for online status
    this.networkMonitor.onOnline(() => this.processQueue());
  }
  
  async addToQueue(mutation: QueuedMutation): Promise<void> {
    // Add to queue with appropriate priority
    await this.db.syncQueue.add(mutation);
    
    // Update local data immediately (optimistic update)
    await this.applyLocalChange(mutation);
    
    // If online, process immediately
    if (this.networkMonitor.isOnline() && !this.isProcessing) {
      this.processQueue();
    }
  }
  
  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Get all pending mutations, sorted by priority and dependencies
      const mutations = await this.getSortedMutations();
      
      // Process in batches to optimize network usage
      const batches = this.createBatches(mutations);
      
      for (const batch of batches) {
        await this.processBatch(batch);
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  private async processBatch(batch: QueuedMutation[]): Promise<void> {
    // Group by table for batch operations
    const byTable = this.groupByTable(batch);
    
    for (const [table, mutations] of Object.entries(byTable)) {
      try {
        // Send to server
        const results = await this.syncToServer(table, mutations);
        
        // Handle results
        for (const result of results) {
          if (result.success) {
            await this.handleSuccessfulSync(result.mutation, result.serverData);
          } else {
            await this.handleFailedSync(result.mutation, result.error);
          }
        }
      } catch (error) {
        // Handle batch failure
        for (const mutation of mutations) {
          await this.handleFailedSync(mutation, 'Batch operation failed');
        }
      }
    }
  }
  
  // Additional methods for queue management...
}
```

## Conflict Resolution Strategy

### Conflict Detection

Conflicts are detected by comparing the server's last updated timestamp with the local base timestamp (the timestamp when the local change was made):

1. **No Conflict**: Local change was made after the last server update
2. **Potential Conflict**: Server record was updated after the local change was initiated
3. **Definite Conflict**: Same field modified both locally and on server

### Resolution Rules

The conflict resolution strategy follows these rules:

1. **Field-Level Resolution**
   - Apply non-conflicting field changes automatically
   - For conflicting fields, apply resolution rules

2. **Resolution Rules by Data Type**
   - **Task Status**: Latest status wins, with notification
   - **Progress Percentage**: Highest value wins
   - **Time Logs**: Merge time logs, flag overlapping entries
   - **Assignments**: Latest assignment wins, with notification
   - **Text Fields**: Present both versions for user selection
   - **Dates**: Latest change wins, with notification
   - **Numeric Values**: Present both for user selection

3. **Special Cases**
   - **Deletion Conflicts**: Server deletion always wins over local modifications
   - **Creation Conflicts**: Create new record with notification of duplicate
   - **Parent-Child Conflicts**: Resolve parent conflicts before children

### Implementation

```typescript
export class ConflictResolver {
  private db: OfflineDatabase;
  
  constructor(db: OfflineDatabase) {
    this.db = db;
  }
  
  async resolveConflict(
    table: string,
    recordId: string,
    localData: any,
    serverData: any,
    baseData: any
  ): Promise<ResolvedData> {
    // Start with server data as base
    const resolved = { ...serverData };
    const conflicts: FieldConflict[] = [];
    
    // Identify all changed fields
    const localChanges = this.getChangedFields(baseData, localData);
    const serverChanges = this.getChangedFields(baseData, serverData);
    
    // Apply automatic resolution rules
    for (const field of localChanges) {
      // If field wasn't changed on server, take local change
      if (!serverChanges.includes(field)) {
        resolved[field] = localData[field];
        continue;
      }
      
      // Field changed in both places - apply resolution rules
      const resolution = this.applyFieldResolutionRules(
        table,
        field,
        localData[field],
        serverData[field],
        baseData[field]
      );
      
      if (resolution.automatic) {
        resolved[field] = resolution.value;
      } else {
        // Add to conflicts for manual resolution
        conflicts.push({
          field,
          localValue: localData[field],
          serverValue: serverData[field],
          baseValue: baseData[field]
        });
      }
    }
    
    return {
      resolvedData: resolved,
      conflicts,
      requiresManualResolution: conflicts.length > 0
    };
  }
  
  private applyFieldResolutionRules(
    table: string,
    field: string,
    localValue: any,
    serverValue: any,
    baseValue: any
  ): { automatic: boolean; value?: any } {
    // Apply specific rules based on table and field
    
    // Task status rules
    if (table === 'tasks' && field === 'status') {
      // Status progression logic
      const progression = ['not_started', 'in_progress', 'completed'];
      const localIndex = progression.indexOf(localValue);
      const serverIndex = progression.indexOf(serverValue);
      
      // Higher status wins (completed > in_progress > not_started)
      if (localIndex > serverIndex) {
        return { automatic: true, value: localValue };
      } else {
        return { automatic: true, value: serverValue };
      }
    }
    
    // Progress percentage - higher value wins
    if (field === 'progress_percentage') {
      return {
        automatic: true,
        value: Math.max(localValue, serverValue)
      };
    }
    
    // Default: require manual resolution
    return { automatic: false };
  }
  
  // Additional methods for conflict resolution...
}
```

### User Interface for Conflict Resolution

When conflicts require manual resolution, a user-friendly interface is presented:

1. **Conflict Notification**
   - Non-blocking notification when conflicts are detected
   - Option to resolve immediately or later

2. **Resolution Interface**
   - Side-by-side comparison of local and server changes
   - Option to select either version or merge manually
   - Batch resolution for similar conflicts

3. **Conflict Prevention**
   - Lock mechanism for records being edited by other users
   - Real-time notifications when online about concurrent edits

## Sync Error Handling

### Error Classification

Errors during synchronization are classified into the following categories:

1. **Transient Errors**
   - Network connectivity issues
   - Server temporary unavailability
   - Rate limiting

2. **Validation Errors**
   - Data validation failures
   - Business rule violations
   - Permission issues

3. **Conflict Errors**
   - Unresolvable conflicts
   - Version mismatch
   - Record deleted on server

4. **Critical Errors**
   - Database corruption
   - Authentication failures
   - API version incompatibility

### Retry Logic

```typescript
async function syncWithRetry(mutation: QueuedMutation): Promise<SyncResult> {
  const maxAttempts = getMaxAttemptsByPriority(mutation.priority);
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await performSync(mutation);
    } catch (error) {
      // Check if error is retryable
      if (!isRetryableError(error)) {
        return {
          success: false,
          error: error.message,
          permanent: true
        };
      }
      
      // Update attempt count
      mutation.attempts = attempt;
      mutation.lastAttempt = Date.now();
      mutation.error = error.message;
      await updateQueueEntry(mutation);
      
      // Exponential backoff with jitter
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1) * (0.5 + Math.random() * 0.5);
        await sleep(delay);
      }
    }
  }
  
  // Max attempts reached
  return {
    success: false,
    error: `Failed after ${maxAttempts} attempts`,
    permanent: false
  };
}

function getMaxAttemptsByPriority(priority: 'high' | 'medium' | 'low'): number {
  switch (priority) {
    case 'high': return 10;    // More retries for critical data
    case 'medium': return 5;
    case 'low': return 3;
    default: return 3;
  }
}

function isRetryableError(error: any): boolean {
  // Network errors are retryable
  if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
    return true;
  }
  
  // Server errors (5xx) are retryable
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }
  
  // Rate limiting is retryable
  if (error.status === 429) {
    return true;
  }
  
  // Other errors are not retryable
  return false;
}
```

### User Notifications

The system provides transparent feedback about sync status:

1. **Status Indicators**
   - Sync status icon in the app header
   - Per-item sync status indicators
   - Progress indicators for large syncs

2. **Notification Types**
   - Toast notifications for quick status updates
   - In-app notification center for sync history
   - Critical error alerts requiring action

3. **Error Recovery Options**
   - Retry button for failed syncs
   - Manual conflict resolution interface
   - Option to discard local changes in favor of server version

## Data Consistency

### Parent-Child Relationship Integrity

Maintaining data integrity across the Projects → Phases → Steps → Tasks hierarchy is critical:

1. **Dependency Tracking**
   - Child records include parent IDs
   - Sync operations respect parent-child dependencies
   - Parents are synced before children

2. **Orphan Prevention**
   - Local validation prevents orphaned records
   - Temporary local IDs for new records created offline
   - ID mapping system to replace temporary IDs after sync

3. **Cascading Updates**
   - Status changes cascade appropriately (e.g., all tasks complete → step complete)
   - Progress calculations maintain consistency

### Implementation

```typescript
export class HierarchyManager {
  private db: OfflineDatabase;
  private syncQueue: SyncQueueManager;
  
  constructor(db: OfflineDatabase, syncQueue: SyncQueueManager) {
    this.db = db;
    this.syncQueue = syncQueue;
  }
  
  async createTaskOffline(task: Task, stepId: string): Promise<string> {
    // Generate temporary ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set parent relationship
    task.step_id = stepId;
    task.id = tempId;
    
    // Add sync metadata
    const taskWithMeta = {
      ...task,
      _syncStatus: 'pending_upload',
      _localUpdatedAt: Date.now(),
      _serverUpdatedAt: null,
      _syncId: generateUuid(),
      _isDeleted: false
    };
    
    // Save to local DB
    await this.db.tasks.add(taskWithMeta);
    
    // Add to sync queue with dependency on parent
    await this.syncQueue.addToQueue({
      id: generateUuid(),
      table: 'tasks',
      recordId: tempId,
      operation: 'create',
      data: task,
      timestamp: Date.now(),
      priority: 'medium',
      attempts: 0,
      lastAttempt: null,
      error: null,
      dependencies: [`step_${stepId}`] // Depends on parent step
    });
    
    // Update parent step's task count
    await this.updateStepTaskCount(stepId);
    
    return tempId;
  }
  
  async updateStepTaskCount(stepId: string): Promise<void> {
    const step = await this.db.steps.get(stepId);
    if (!step) return;
    
    // Count tasks for this step
    const taskCount = await this.db.tasks.where('step_id').equals(stepId).count();
    
    // Update step
    await this.db.steps.update(stepId, {
      task_count: taskCount,
      _syncStatus: 'modified',
      _localUpdatedAt: Date.now()
    });
    
    // Queue step update
    await this.syncQueue.addToQueue({
      id: generateUuid(),
      table: 'steps',
      recordId: stepId,
      operation: 'update',
      data: { task_count: taskCount },
      timestamp: Date.now(),
      priority: 'low', // Lower priority for metadata updates
      attempts: 0,
      lastAttempt: null,
      error: null,
      dependencies: []
    });
    
    // Update phase progress if needed
    if (step.phase_id) {
      await this.updatePhaseProgress(step.phase_id);
    }
  }
  
  // Additional methods for maintaining hierarchy consistency...
}
```

### ID Mapping and Resolution

For new records created offline, the system maintains a mapping between temporary local IDs and permanent server IDs:

```typescript
export class IdMapper {
  private db: OfflineDatabase;
  
  constructor(db: OfflineDatabase) {
    this.db = db;
  }
  
  async mapTemporaryId(tempId: string, permanentId: string, table: string): Promise<void> {
    // Store the mapping
    await this.db.idMappings.add({
      tempId,
      permanentId,
      table,
      createdAt: Date.now()
    });
    
    // Update all references in the database
    await this.updateReferences(tempId, permanentId, table);
  }
  
  private async updateReferences(tempId: string, permanentId: string, table: string): Promise<void> {
    // Update references based on the table
    switch (table) {
      case 'projects':
        await this.db.phases.where('project_id').equals(tempId).modify({
          project_id: permanentId
        });
        break;
      case 'phases':
        await this.db.steps.where('phase_id').equals(tempId).modify({
          phase_id: permanentId
        });
        break;
      case 'steps':
        await this.db.tasks.where('step_id').equals(tempId).modify({
          step_id: permanentId
        });
        break;
      case 'tasks':
        // Update task dependencies
        await this.db.taskDependencies.where('task_id').equals(tempId).modify({
          task_id: permanentId
        });
        await this.db.taskDependencies.where('depends_on_task_id').equals(tempId).modify({
          depends_on_task_id: permanentId
        });
        break;
    }
    
    // Update any pending sync queue items
    await this.updateQueueReferences(tempId, permanentId, table);
  }
  
  // Additional methods for ID mapping...
}
```

## Bandwidth Optimization

### Data Compression and Minimization

To optimize bandwidth usage, especially on mobile connections:

1. **Payload Optimization**
   - Send only modified fields, not entire records
   - Use compression for all API requests and responses
   - Implement binary formats for structured data (e.g., Protocol Buffers)

2. **Batch Operations**
   - Group related operations into batches
   - Prioritize small, critical updates over large, non-critical ones
   - Implement delta updates for large datasets

3. **Incremental Sync**
   - Sync only records modified since last successful sync
   - Use server-side timestamps for accurate change tracking
   - Implement cursor-based pagination for large datasets

### Large File Handling

File attachments require special handling:

1. **Attachment Strategy**
   - Store file metadata in IndexedDB
   - Store actual files in browser's Cache API
   - Upload/download files separately from data sync

2. **File Optimization**
   - Compress images and documents before upload
   - Generate and use thumbnails for preview
   - Implement resumable uploads for large files

3. **Prioritization**
   - Critical documents (e.g., safety reports) get high priority
   - Large files (>5MB) get lower priority
   - User can manually prioritize specific files

```typescript
export class FileManager {
  private db: OfflineDatabase;
  private cacheStorage: Cache;
  
  constructor(db: OfflineDatabase) {
    this.db = db;
    this.initCache();
  }
  
  private async initCache() {
    this.cacheStorage = await caches.open('fibreflow-attachments');
  }
  
  async storeFile(file: File, metadata: FileMetadata): Promise<string> {
    // Generate local URI
    const localUri = `local-file://${Date.now()}-${file.name}`;
    
    // Store file in Cache API
    const response = new Response(file);
    await this.cacheStorage.put(localUri, response);
    
    // Store metadata in IndexedDB
    const fileRecord = {
      id: generateUuid(),
      name: file.name,
      size: file.size,
      type: file.type,
      localUri,
      relatedTable: metadata.relatedTable,
      relatedRecordId: metadata.relatedRecordId,
      createdAt: Date.now(),
      _syncStatus: 'pending_upload'
    };
    
    await this.db.files.add(fileRecord);
    
    // Add to upload queue
    await this.db.fileQueue.add({
      id: generateUuid(),
      relatedTable: metadata.relatedTable,
      relatedRecordId: metadata.relatedRecordId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      localUri,
      uploadStatus: 'pending',
      uploadProgress: 0,
      priority: this.determineFilePriority(file, metadata)
    });
    
    return fileRecord.id;
  }
  
  private determineFilePriority(file: File, metadata: FileMetadata): 'high' | 'medium' | 'low' {
    // Critical document types get high priority
    const criticalTypes = ['application/pdf', 'text/csv', 'application/json'];
    if (criticalTypes.includes(file.type)) {
      return 'high';
    }
    
    // Large files get low priority
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return 'low';
    }
    
    // Default to medium
    return 'medium';
  }
  
  // Additional methods for file management...
}
```

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- Set up IndexedDB schema
- Implement basic online/offline detection
- Create sync queue data structures
- Develop initial UI indicators for sync status

### Phase 2: Core Functionality (Weeks 3-4)
- Implement data caching for offline access
- Develop basic sync queue processing
- Create simple conflict detection
- Implement temporary ID system

### Phase 3: Advanced Features (Weeks 5-6)
- Develop sophisticated conflict resolution
- Implement file attachment handling
- Create bandwidth optimization features
- Develop comprehensive error handling

### Phase 4: Refinement (Weeks 7-8)
- Implement user interface for conflict resolution
- Develop sync analytics and monitoring
- Optimize performance and battery usage
- Create admin tools for sync management

### Phase 5: Testing and Rollout (Weeks 9-10)
- Comprehensive testing in various network conditions
- Field testing with actual users
- Gradual rollout using feature flags
- Documentation and training materials

## Testing Strategy

### Test Scenarios

1. **Connectivity Scenarios**
   - Complete offline operation
   - Intermittent connectivity
   - Low bandwidth connections
   - High latency connections

2. **Data Scenarios**
   - Large datasets (projects with 1000+ tasks)
   - Concurrent edits by multiple users
   - Complex hierarchical changes
   - Various conflict scenarios

3. **Device Scenarios**
   - Low-end mobile devices
   - Limited storage devices
   - Various browsers and versions
   - Battery optimization testing

### Automated Testing

```typescript
// Example test for offline task creation and sync
describe('Offline Task Creation', () => {
  beforeEach(async () => {
    // Set up test environment
    await setupTestDatabase();
    await goOffline();
  });
  
  afterEach(async () => {
    // Clean up
    await cleanupTestDatabase();
    await goOnline();
  });
  
  test('should create task offline and sync when online', async () => {
    // Create task while offline
    const taskId = await createTask({
      title: 'Test Task',
      description: 'Created offline',
      step_id: 'step-123',
      status: 'not_started'
    });
    
    // Verify task exists in local DB
    const localTask = await getLocalTask(taskId);
    expect(localTask).toBeDefined();
    expect(localTask._syncStatus).toBe('pending_upload');
    
    // Verify task is in sync queue
    const queueItem = await getSyncQueueItem('tasks', taskId);
    expect(queueItem).toBeDefined();
    expect(queueItem.operation).toBe('create');
    
    // Go online and wait for sync
    await goOnline();
    await waitForSync();
    
    // Verify task was synced to server
    const serverTask = await getServerTask(taskId);
    expect(serverTask).toBeDefined();
    expect(serverTask.title).toBe('Test Task');
    
    // Verify local task was updated with server ID
    const updatedLocalTask = await getLocalTask(taskId);
    expect(updatedLocalTask._syncStatus).toBe('synced');
    expect(updatedLocalTask._serverUpdatedAt).not.toBeNull();
  });
  
  // More test cases...
});
```

---

This offline sync strategy provides a comprehensive approach to enabling field workers to work effectively in areas with poor connectivity while maintaining data integrity and optimizing bandwidth usage. The implementation follows FibreFlow's architectural patterns and leverages existing systems like optimistic updates, feature flags, and audit logging.
