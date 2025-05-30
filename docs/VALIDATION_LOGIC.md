# Validation Logic Documentation

This document defines the validation rules and logic for the FibreFlow system, including circular dependency prevention, business constraint validations, data integrity rules, and permission matrices.

## Table of Contents
- [Circular Dependency Prevention Algorithm](#circular-dependency-prevention-algorithm)
- [Business Constraint Validations](#business-constraint-validations)
- [Data Integrity Rules](#data-integrity-rules)
- [Permission Matrices](#permission-matrices)
- [Implementation Guidelines](#implementation-guidelines)
- [Performance Considerations](#performance-considerations)

## Circular Dependency Prevention Algorithm

### Algorithm Overview
The FibreFlow system implements a directed graph-based algorithm to detect and prevent circular dependencies in project tasks, ensuring project schedules remain logically sound.

### Implementation Details

#### Data Structure
```typescript
interface TaskNode {
  id: string;
  dependencies: string[]; // IDs of tasks this task depends on
  dependents: string[];   // IDs of tasks that depend on this task
}

type TaskGraph = Map<string, TaskNode>;
```

#### Detection Algorithm
The system uses a depth-first search (DFS) with cycle detection:

```typescript
function detectCycle(taskGraph: TaskGraph): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function dfsVisit(taskId: string): boolean {
    // Already completely explored this node
    if (visited.has(taskId)) return false;
    
    // Node is in current exploration path - cycle detected
    if (recursionStack.has(taskId)) return true;
    
    // Mark node as being explored
    recursionStack.add(taskId);
    
    // Explore all dependencies
    const node = taskGraph.get(taskId);
    if (node) {
      for (const dependencyId of node.dependencies) {
        if (dfsVisit(dependencyId)) return true;
      }
    }
    
    // Remove from recursion stack and mark as fully explored
    recursionStack.delete(taskId);
    visited.add(taskId);
    
    return false;
  }
  
  // Check each node that hasn't been fully explored
  for (const taskId of taskGraph.keys()) {
    if (!visited.has(taskId)) {
      if (dfsVisit(taskId)) return true;
    }
  }
  
  return false;
}
```

#### Prevention Mechanism
1. When a new dependency is added, the system:
   - Temporarily adds the dependency to the graph
   - Runs the cycle detection algorithm
   - If a cycle is detected:
     - Prevents the dependency from being added
     - Provides visual feedback to the user
     - Suggests alternative dependency structures
   - If no cycle is detected, commits the change

2. Validation is performed:
   - On task creation/modification in the UI
   - Before database writes via API
   - During bulk imports/operations

### Time and Space Complexity
- Time Complexity: O(V + E) where V is the number of tasks and E is the number of dependencies
- Space Complexity: O(V) for the recursion stack and visited set
- Performance optimization: Incremental validation for large projects

## Business Constraint Validations

### Project Constraints

#### Timeline Constraints
1. **Project Duration Limits**
   - Minimum project duration: 5 business days
   - Maximum project duration: 730 days (2 years)
   - Validation: `endDate - startDate >= 5 business days && endDate - startDate <= 730 days`

2. **Phase Duration Constraints**
   - Planning phase: 5-60 days
   - Design phase: 10-90 days
   - Permitting phase: 15-180 days
   - Construction phase: 30-365 days
   - Testing phase: 3-30 days
   - Activation phase: 1-14 days

3. **Milestone Sequencing**
   - Milestones must be in chronological order
   - Validation: `milestone[i].date < milestone[i+1].date`

#### Resource Constraints
1. **Staff Allocation**
   - Maximum concurrent projects per staff: 5
   - Maximum daily allocation: 8 hours
   - Validation: `staffProjects.count <= 5 && dailyHours <= 8`

2. **Equipment Allocation**
   - Equipment cannot be double-booked
   - Validation: Check for overlapping date ranges in equipment assignments

3. **Budget Constraints**
   - Actual costs cannot exceed budget by more than 15% without approval
   - Validation: `actualCost <= budgetedCost * 1.15 || approvalExists`

### Task Constraints

1. **Task Assignment Rules**
   - Tasks must be assigned to staff with appropriate role/skills
   - Validation: `task.requiredSkills.every(skill => staff.skills.includes(skill))`

2. **Task Duration Limits**
   - Minimum task duration: 1 hour
   - Maximum task duration: 30 days
   - Validation: `task.duration >= 1 hour && task.duration <= 30 days`

3. **Concurrent Task Limits**
   - Maximum concurrent tasks per staff member: 10
   - Validation: `staff.activeTasks.length <= 10`

### Customer Constraints

1. **Service Level Agreements**
   - Response time to customer inquiries: < 24 hours
   - Issue resolution time: Based on priority (P1: 4h, P2: 24h, P3: 72h)
   - Validation: `responseTime < 24h && resolutionTime < SLA[priority]`

2. **Approval Timeframes**
   - Customer approval timeout: 5 business days
   - Internal approval timeout: 2 business days
   - Validation: Automated escalation if `currentDate - requestDate > timeoutPeriod`

## Data Integrity Rules

### General Data Rules

1. **Required Fields**
   - All entities must have the following fields populated:
     - Unique ID (auto-generated)
     - Created timestamp
     - Updated timestamp
     - Created by user
     - Updated by user

2. **Soft Delete Implementation**
   - Records are never physically deleted
   - Deleted records have `archived_at` timestamp set
   - Validation: `DELETE operations must be replaced with UPDATE archived_at = current_timestamp`

3. **Data Type Validation**
   - String length limits enforced
   - Numeric range validation
   - Date format validation (ISO 8601)
   - Email format validation

4. **Referential Integrity**
   - Foreign key constraints enforced at database level
   - Application-level validation before operations
   - Orphaned records prevention

### Entity-Specific Rules

#### Projects
1. **Project Creation**
   - Required fields: name, start_date, customer_id, project_type
   - Unique constraint: project_code must be unique
   - Validation: `!existingProjects.some(p => p.project_code === newProject.project_code)`

2. **Project Modification**
   - Status changes must follow valid progression
   - Budget changes > 10% require approval
   - Schedule changes > 5 days require approval

#### Tasks
1. **Task Creation**
   - Required fields: name, project_id, estimated_hours
   - Valid project_id must exist
   - Validation: `projects.some(p => p.id === task.project_id)`

2. **Task Updates**
   - Status changes must follow valid workflow
   - Completion requires all subtasks to be complete
   - Validation: `task.subtasks.every(st => st.status === 'COMPLETE')`

#### Users
1. **User Creation**
   - Required fields: email, name, role
   - Email must be unique
   - Password must meet complexity requirements
   - Validation: `!existingUsers.some(u => u.email === newUser.email)`

2. **User Modification**
   - Role changes require admin approval
   - Email changes require verification
   - Validation: `userHasPermission('admin') || !isChanged('role')`

### Data Validation Implementation
1. **Client-Side Validation**
   - Form validation using React Hook Form
   - Real-time feedback to users
   - Prevent form submission with invalid data

2. **API Validation**
   - Server-side validation on all API endpoints
   - Consistent error response format
   - Detailed validation error messages

3. **Database Validation**
   - Constraints and triggers in Supabase
   - Row-level security policies
   - Database function validations

## Permission Matrices

### Role-Based Access Control

#### User Roles
| Role | Description |
|------|-------------|
| Admin | System administrator with full access |
| Project Manager | Manages projects and teams |
| Engineer | Works on technical aspects of projects |
| Field Technician | Performs on-site installation and testing |
| Customer Service | Handles customer communication |
| Finance | Manages financial aspects of projects |
| Customer | External user with limited access |

#### Permission Matrix by Role

| Resource | Action | Admin | Project Manager | Engineer | Field Technician | Customer Service | Finance | Customer |
|----------|--------|-------|-----------------|----------|------------------|------------------|---------|----------|
| **Projects** |
| | View All | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| | View Assigned | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Create | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| | Update | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| | Delete | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| | Change Status | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Tasks** |
| | View All | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| | View Assigned | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Create | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| | Update | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| | Delete | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| | Assign | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| | Complete | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Users** |
| | View All | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| | View Team | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| | Create | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| | Update | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| | Delete | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| | Change Role | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Finances** |
| | View Summary | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| | View Details | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| | Create Expense | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| | Approve Expense | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| | Generate Invoice | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Documents** |
| | View | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Upload | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| | Approve | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| | Delete | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Reports** |
| | View All | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| | View Project | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Create | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| | Export | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |

### Row-Level Security Policies

#### Projects Table
```sql
-- Admin can see all projects
CREATE POLICY admin_all_projects ON projects
  FOR ALL
  TO admin
  USING (true);

-- Project Managers can see all projects
CREATE POLICY pm_all_projects ON projects
  FOR SELECT
  TO project_manager
  USING (true);

-- Project Managers can modify projects they manage
CREATE POLICY pm_manage_projects ON projects
  FOR UPDATE
  TO project_manager
  USING (project_manager_id = auth.uid());

-- Staff can see projects they're assigned to
CREATE POLICY staff_assigned_projects ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_staff
      WHERE project_staff.project_id = projects.id
      AND project_staff.staff_id = auth.uid()
    )
  );

-- Customers can only see their own projects
CREATE POLICY customer_own_projects ON projects
  FOR SELECT
  TO customer
  USING (customer_id = auth.uid());
```

#### Tasks Table
```sql
-- Admin can see and modify all tasks
CREATE POLICY admin_all_tasks ON tasks
  FOR ALL
  TO admin
  USING (true);

-- Users can see tasks for projects they have access to
CREATE POLICY view_project_tasks ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_staff
      WHERE project_staff.project_id = tasks.project_id
      AND project_staff.staff_id = auth.uid()
    )
  );

-- Users can only update tasks assigned to them
CREATE POLICY update_assigned_tasks ON tasks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid());
```

### Permission Implementation

1. **Client-Side Implementation**
   - UI elements conditionally rendered based on permissions
   - Actions disabled/hidden when not permitted
   - Clear feedback when permission is denied

2. **Server-Side Implementation**
   - JWT verification for all API requests
   - Role-based middleware for route protection
   - Function-level permission checks

3. **Database Implementation**
   - Row-level security policies in Supabase
   - Role-based access control
   - Audit logging for permission changes

## Implementation Guidelines

### Validation Implementation Strategy

1. **Layered Validation Approach**
   - Client-side validation for immediate feedback
   - API-level validation for security
   - Database-level validation as final safeguard

2. **Validation Code Organization**
   - Shared validation utilities in `/src/lib/validation/`
   - Entity-specific validators in `/src/lib/validation/entities/`
   - Custom hooks for form validation in `/src/hooks/validation/`

3. **Error Handling**
   - Consistent error response format
   - Detailed validation error messages
   - Client-side error display components

### Coding Standards for Validation

1. **TypeScript Type Safety**
   - Strong typing for all validation functions
   - Interface-based validation schemas
   - No use of `any` type

2. **Testing Requirements**
   - Unit tests for all validation functions
   - Integration tests for API validation
   - Edge case coverage

3. **Performance Considerations**
   - Optimize validation for large datasets
   - Use memoization for expensive validations
   - Batch validations where appropriate

## Performance Considerations

### Validation Performance Requirements

1. **Response Time**
   - Client-side validation: < 10ms
   - API validation: < 30ms
   - Database validation: < 50ms

2. **Memory Usage**
   - Validation operations must not exceed 20MB memory usage
   - Large dataset validations must use streaming approaches

3. **Optimization Techniques**
   - Early termination for validation chains
   - Caching validation results where appropriate
   - Incremental validation for large datasets

### Monitoring and Optimization

1. **Performance Metrics**
   - Track validation execution time
   - Monitor memory usage during validation
   - Log validation failures for analysis

2. **Continuous Improvement**
   - Regular review of slow validation operations
   - Optimization of frequently used validations
   - Refactoring of validation logic based on usage patterns

---

*This document is subject to change as project requirements evolve. All changes must be documented and communicated to the development team.*

Last Updated: May 30, 2025
