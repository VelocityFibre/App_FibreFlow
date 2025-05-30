# Project Management API Specification

## Base URL
`/api/projects`

## Authentication
All endpoints require authentication via Supabase JWT token in Authorization header:
`Authorization: Bearer <token>`

## Endpoints

### 1. Get Project Hierarchy
`GET /api/projects/:id/hierarchy`

**Description**: Retrieves complete project hierarchy including phases, steps, and tasks

**Response**:
```json
{
  "project": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Fiber Installation - Main Street",
    "client_id": "456e7890-e89b-12d3-a456-426614174000",
    "project_manager_id": "789e0123-e89b-12d3-a456-426614174000",
    "budget": 150000.00,
    "progress_percentage": 35,
    "phases": [
      {
        "id": "uuid",
        "name": "Planning",
        "phase_type": "planning",
        "order_index": 1,
        "status": "in_progress",
        "steps": [
          {
            "id": "uuid",
            "name": "Site Survey",
            "order_index": 1,
            "status": "completed",
            "tasks": [
              {
                "id": "uuid",
                "title": "Conduct physical survey",
                "assigned_to": "uuid",
                "status": "completed",
                "progress_percentage": 100
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 2. Create Project
`POST /api/projects`

**Description**: Creates a new project

**Request Body**:
```json
{
  "name": "New Fiber Project",
  "client_id": "uuid",
  "project_manager_id": "uuid",
  "start_date": "2024-01-15",
  "end_date": "2024-06-30",
  "budget": 200000.00,
  "location_id": "uuid"
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "New Fiber Project",
  "client_id": "uuid",
  "project_manager_id": "uuid",
  "start_date": "2024-01-15",
  "end_date": "2024-06-30",
  "budget": 200000.00,
  "location_id": "uuid",
  "created_at": "2024-01-10T12:00:00Z",
  "updated_at": "2024-01-10T12:00:00Z"
}
```

### 3. Get Projects
`GET /api/projects`

**Description**: Retrieves a list of projects

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)
- `sort`: Field to sort by (default: "created_at")
- `order`: Sort order ("asc" or "desc", default: "desc")
- `client_id`: Filter by client ID
- `project_manager_id`: Filter by project manager ID
- `status`: Filter by status
- `location_id`: Filter by location ID
- `search`: Search term for project name

**Response**:
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Fiber Installation - Main Street",
      "client_id": "456e7890-e89b-12d3-a456-426614174000",
      "project_manager_id": "789e0123-e89b-12d3-a456-426614174000",
      "start_date": "2024-01-15",
      "end_date": "2024-06-30",
      "budget": 150000.00,
      "progress_percentage": 35,
      "location_id": "uuid",
      "created_at": "2024-01-10T12:00:00Z",
      "updated_at": "2024-01-10T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### 4. Get Project by ID
`GET /api/projects/:id`

**Description**: Retrieves a specific project by ID

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Fiber Installation - Main Street",
  "client_id": "456e7890-e89b-12d3-a456-426614174000",
  "project_manager_id": "789e0123-e89b-12d3-a456-426614174000",
  "start_date": "2024-01-15",
  "end_date": "2024-06-30",
  "budget": 150000.00,
  "progress_percentage": 35,
  "location_id": "uuid",
  "created_at": "2024-01-10T12:00:00Z",
  "updated_at": "2024-01-10T12:00:00Z"
}
```

### 5. Update Project
`PATCH /api/projects/:id`

**Description**: Updates a specific project

**Request Body**:
```json
{
  "name": "Updated Fiber Project",
  "budget": 250000.00,
  "end_date": "2024-07-15"
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Updated Fiber Project",
  "client_id": "456e7890-e89b-12d3-a456-426614174000",
  "project_manager_id": "789e0123-e89b-12d3-a456-426614174000",
  "start_date": "2024-01-15",
  "end_date": "2024-07-15",
  "budget": 250000.00,
  "progress_percentage": 35,
  "location_id": "uuid",
  "created_at": "2024-01-10T12:00:00Z",
  "updated_at": "2024-01-15T09:30:00Z"
}
```

### 6. Delete Project
`DELETE /api/projects/:id`

**Description**: Soft deletes a project by setting the `archived_at` timestamp

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "archived_at": "2024-01-20T14:15:00Z"
}
```

### 7. Reorder Tasks
`POST /api/tasks/reorder`

**Description**: Reorders tasks, potentially moving them between steps

**Request Body**:
```json
{
  "moves": [
    {
      "task_id": "uuid",
      "new_step_id": "uuid",
      "new_order_index": 2
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "updated_tasks": [
    {
      "id": "uuid",
      "step_id": "uuid",
      "order_index": 2
    }
  ]
}
```

### 8. Check Circular Dependencies
`POST /api/tasks/check-dependencies`

**Description**: Checks if adding a dependency would create a circular dependency

**Request Body**:
```json
{
  "task_id": "uuid",
  "target_depends_on": "uuid"
}
```

**Response**:
```json
{
  "has_circular_dependency": false
}
```

### 9. Bulk Update Status
`PATCH /api/tasks/bulk-status`

**Description**: Updates the status of multiple tasks at once

**Request Body**:
```json
{
  "task_ids": ["uuid1", "uuid2", "uuid3"],
  "new_status": "in_progress"
}
```

**Response**:
```json
{
  "success": true,
  "updated_count": 3,
  "updated_tasks": [
    {
      "id": "uuid1",
      "status": "in_progress"
    },
    {
      "id": "uuid2",
      "status": "in_progress"
    },
    {
      "id": "uuid3",
      "status": "in_progress"
    }
  ]
}
```

### 10. Create Phase
`POST /api/projects/:project_id/phases`

**Description**: Creates a new phase for a project

**Request Body**:
```json
{
  "name": "Construction",
  "phase_type": "construction",
  "order_index": 2
}
```

**Response**:
```json
{
  "id": "uuid",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Construction",
  "phase_type": "construction",
  "order_index": 2,
  "status": "not_started",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### 11. Get Phases
`GET /api/projects/:project_id/phases`

**Description**: Retrieves all phases for a project

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "project_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Planning",
      "phase_type": "planning",
      "order_index": 1,
      "status": "in_progress",
      "created_at": "2024-01-10T12:00:00Z",
      "updated_at": "2024-01-15T09:30:00Z"
    }
  ]
}
```

### 12. Create Step
`POST /api/phases/:phase_id/steps`

**Description**: Creates a new step for a phase

**Request Body**:
```json
{
  "name": "Equipment Procurement",
  "order_index": 1
}
```

**Response**:
```json
{
  "id": "uuid",
  "phase_id": "uuid",
  "name": "Equipment Procurement",
  "order_index": 1,
  "status": "not_started",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 13. Create Task
`POST /api/steps/:step_id/tasks`

**Description**: Creates a new task for a step

**Request Body**:
```json
{
  "title": "Order fiber cables",
  "description": "Place order for 5km of fiber optic cables",
  "assigned_to": "uuid",
  "due_date": "2024-02-01",
  "estimated_hours": 2,
  "priority": "high"
}
```

**Response**:
```json
{
  "id": "uuid",
  "step_id": "uuid",
  "title": "Order fiber cables",
  "description": "Place order for 5km of fiber optic cables",
  "assigned_to": "uuid",
  "due_date": "2024-02-01",
  "estimated_hours": 2,
  "priority": "high",
  "status": "not_started",
  "progress_percentage": 0,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

### 14. Update Task
`PATCH /api/tasks/:id`

**Description**: Updates a specific task

**Request Body**:
```json
{
  "status": "in_progress",
  "progress_percentage": 50,
  "actual_hours": 1
}
```

**Response**:
```json
{
  "id": "uuid",
  "step_id": "uuid",
  "title": "Order fiber cables",
  "description": "Place order for 5km of fiber optic cables",
  "assigned_to": "uuid",
  "due_date": "2024-02-01",
  "estimated_hours": 2,
  "actual_hours": 1,
  "priority": "high",
  "status": "in_progress",
  "progress_percentage": 50,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-16T09:00:00Z"
}
```

### 15. Add Task Dependency
`POST /api/tasks/:task_id/dependencies`

**Description**: Adds a dependency between tasks

**Request Body**:
```json
{
  "depends_on_task_id": "uuid"
}
```

**Response**:
```json
{
  "id": "uuid",
  "task_id": "uuid",
  "depends_on_task_id": "uuid",
  "created_at": "2024-01-15T14:00:00Z"
}
```

### 16. Remove Task Dependency
`DELETE /api/tasks/:task_id/dependencies/:depends_on_task_id`

**Description**: Removes a dependency between tasks

**Response**:
```json
{
  "success": true
}
```

### 17. Get Task Dependencies
`GET /api/tasks/:task_id/dependencies`

**Description**: Gets all dependencies for a task

**Response**:
```json
{
  "depends_on": [
    {
      "id": "uuid",
      "title": "Conduct site survey",
      "status": "completed"
    }
  ],
  "dependent_tasks": [
    {
      "id": "uuid",
      "title": "Install fiber cables",
      "status": "not_started"
    }
  ]
}
```

### 18. Add Task Attachment
`POST /api/tasks/:task_id/attachments`

**Description**: Adds an attachment to a task

**Request Body**: Multipart form data with file

**Response**:
```json
{
  "id": "uuid",
  "task_id": "uuid",
  "filename": "site_survey.pdf",
  "file_size": 1024000,
  "file_type": "application/pdf",
  "url": "https://storage.example.com/files/site_survey.pdf",
  "created_at": "2024-01-16T10:00:00Z",
  "created_by": "uuid"
}
```

### 19. Remove Task Attachment
`DELETE /api/tasks/:task_id/attachments/:attachment_id`

**Description**: Removes an attachment from a task

**Response**:
```json
{
  "success": true
}
```

### 20. Get Project Analytics
`GET /api/projects/:id/analytics`

**Description**: Retrieves analytics data for a project

**Response**:
```json
{
  "progress": {
    "overall_percentage": 35,
    "phases_completed": 1,
    "phases_total": 5,
    "tasks_completed": 12,
    "tasks_total": 45
  },
  "time": {
    "days_elapsed": 15,
    "days_remaining": 167,
    "estimated_completion_date": "2024-06-15",
    "on_schedule": true
  },
  "budget": {
    "total": 150000.00,
    "spent": 45000.00,
    "remaining": 105000.00,
    "percentage_used": 30
  },
  "resources": {
    "staff_assigned": 5,
    "equipment_allocated": 3,
    "material_usage": {
      "fiber_cable": {
        "allocated": "5km",
        "used": "1.5km"
      }
    }
  }
}
```

### 21. Subscribe to Project Updates
`GET /api/projects/:id/subscribe`

**Description**: Establishes a WebSocket connection for real-time project updates

**Events**:
- `project_updated`: When project details are updated
- `phase_status_changed`: When a phase status changes
- `task_created`: When a new task is created
- `task_updated`: When a task is updated
- `task_status_changed`: When a task status changes
- `comment_added`: When a comment is added to a task

**Example Event**:
```json
{
  "event": "task_status_changed",
  "data": {
    "task_id": "uuid",
    "previous_status": "in_progress",
    "new_status": "completed",
    "updated_by": "uuid",
    "timestamp": "2024-01-20T15:30:00Z"
  }
}
```

### 22. Register Webhook
`POST /api/projects/:id/webhooks`

**Description**: Registers a webhook for project events

**Request Body**:
```json
{
  "url": "https://example.com/webhook",
  "events": ["phase_completion", "task_assignment_change", "budget_threshold_alert"],
  "secret": "webhookSecret123"
}
```

**Response**:
```json
{
  "id": "uuid",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://example.com/webhook",
  "events": ["phase_completion", "task_assignment_change", "budget_threshold_alert"],
  "created_at": "2024-01-20T16:00:00Z"
}
```

### 23. Search Projects
`GET /api/projects/search`

**Description**: Searches for projects across multiple fields

**Query Parameters**:
- `q`: Search query
- `fields`: Fields to search in (comma-separated, default: "name,description")
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)

**Response**:
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Fiber Installation - Main Street",
      "client_id": "456e7890-e89b-12d3-a456-426614174000",
      "project_manager_id": "789e0123-e89b-12d3-a456-426614174000",
      "start_date": "2024-01-15",
      "end_date": "2024-06-30",
      "budget": 150000.00,
      "progress_percentage": 35,
      "location_id": "uuid",
      "created_at": "2024-01-10T12:00:00Z",
      "updated_at": "2024-01-15T09:30:00Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Task cannot depend on itself",
  "code": "CIRCULAR_DEPENDENCY"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication token is missing or invalid"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "message": "You do not have permission to modify this project"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "Project with ID 123e4567-e89b-12d3-a456-426614174000 does not exist"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "A project with this name already exists for this client"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests, please try again in 60 seconds",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

- 100 requests per minute per user
- 429 Too Many Requests response when exceeded
- Headers included in responses:
  - `X-RateLimit-Limit`: Maximum number of requests allowed per minute
  - `X-RateLimit-Remaining`: Number of requests remaining in the current window
  - `X-RateLimit-Reset`: Time in seconds until the rate limit resets

## Pagination

All list endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)

Responses include a pagination object:
```json
"pagination": {
  "total": 42,
  "page": 1,
  "limit": 10,
  "pages": 5
}
```

## Filtering

Most list endpoints support filtering with query parameters specific to the resource type.

Common filters include:
- `status`: Filter by status (e.g., "not_started", "in_progress", "completed")
- `created_after`: ISO-8601 date to filter resources created after this date
- `created_before`: ISO-8601 date to filter resources created before this date
- `updated_after`: ISO-8601 date to filter resources updated after this date
- `updated_before`: ISO-8601 date to filter resources updated before this date

## Sorting

Most list endpoints support sorting with the following query parameters:
- `sort`: Field to sort by (default varies by endpoint)
- `order`: Sort order ("asc" or "desc", default: "desc")

## Webhooks

Projects can configure webhooks for:
- `phase_completion`: Triggered when a phase is marked as completed
- `task_assignment_change`: Triggered when a task is assigned to a different user
- `budget_threshold_alert`: Triggered when project spending reaches a configured threshold

Webhook payloads include:
- Event type
- Timestamp
- Project ID
- Resource ID (e.g., phase ID, task ID)
- Previous state
- New state
- User ID who triggered the change

## Real-time Subscriptions

Real-time updates are available through WebSocket connections. Clients can subscribe to specific projects or resources to receive updates as they happen.

## Audit Trail

All API operations that modify resources are logged in the audit trail. Each audit log entry includes:
- Timestamp
- User ID
- Action type (create, update, delete)
- Resource type (project, phase, step, task)
- Resource ID
- Changes made

## API Versioning

The API version is specified in the URL path:
`/api/v1/projects`

When breaking changes are introduced, a new version will be created while maintaining backward compatibility with previous versions for a deprecation period.
