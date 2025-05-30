# FibreFlow Database Schema

This document provides a comprehensive overview of the FibreFlow database schema, including all tables, their relationships, and field descriptions.

## Tables Overview

| Table Name | Description |
|------------|-------------|
| projects | Main projects table for fiber installation projects |
| new_customers | Customer information |
| locations | Project locations |
| staff | Staff members and project managers |
| phases | Project workflow phases |
| project_phases | Links projects to phases |
| tasks | Task definitions |
| project_tasks | Tasks assigned to specific project phases |
| audit_logs | Audit trail for tracking changes |

## Table Schemas

### projects

The main table for fiber installation projects.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | UUID | Primary key | PRIMARY KEY |
| project_name | TEXT | Name of the project | |
| customer_id | UUID | Reference to customer | REFERENCES new_customers(id) |
| region | TEXT | Geographic region | |
| status | TEXT | Project status (Not Started, In Progress, etc.) | |
| start_date | DATE | Project start date | |
| end_date | DATE | Expected completion date | |
| location_id | UUID | Reference to location | REFERENCES locations(id) |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp | DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp | DEFAULT NOW() |
| total_homes_po | INTEGER | Total homes in purchase order | |
| total_poles_boq | INTEGER | Total poles in bill of quantities | |
| *Additional operational metrics* | | | |

### new_customers

Customer information table.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | UUID | Primary key | PRIMARY KEY |
| name | TEXT | Customer name | NOT NULL |
| address_line1 | TEXT | Address line 1 | |
| address_line2 | TEXT | Address line 2 | |
| city | TEXT | City | |
| postal_code | TEXT | Postal code | |
| email | TEXT | Contact email | |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp | DEFAULT NOW() |

### locations

Project locations table.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | UUID | Primary key | PRIMARY KEY |
| location_name | TEXT | Location name | NOT NULL |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp | DEFAULT NOW() |

### phases

Master list of project phases.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | UUID | Primary key | PRIMARY KEY |
| name | TEXT | Phase name | NOT NULL |
| description | TEXT | Phase description | |
| order_no | INTEGER | Order number for sequencing | |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp | DEFAULT NOW() |

### project_phases

Links projects to specific phases.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | UUID | Primary key | PRIMARY KEY |
| project_id | UUID | Reference to project | REFERENCES projects(id) ON DELETE CASCADE |
| phase_id | UUID | Reference to phase | REFERENCES phases(id) ON DELETE CASCADE |
| status | TEXT | Phase status (pending, active, completed) | DEFAULT 'pending' |
| start_date | DATE | Phase start date | |
| end_date | DATE | Phase end date | |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp | DEFAULT NOW() |

### tasks

Master list of task definitions.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | INTEGER | Primary key | PRIMARY KEY |
| name | TEXT | Task name | NOT NULL |
| description | TEXT | Task description | |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp | DEFAULT NOW() |

### project_tasks

Tasks assigned to specific project phases.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | UUID | Primary key | PRIMARY KEY |
| project_phase_id | UUID | Reference to project phase | REFERENCES project_phases(id) ON DELETE CASCADE |
| task_id | INTEGER | Reference to task | REFERENCES tasks(id) ON DELETE CASCADE |
| status | TEXT | Task status (pending, in_progress, done) | DEFAULT 'pending' |
| assigned_to | INTEGER | Staff member assigned | |
| due_date | DATE | Task due date | |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp | DEFAULT NOW() |

### audit_logs

Audit trail for tracking changes.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | UUID | Primary key | PRIMARY KEY |
| user_id | TEXT | User who made the change | |
| action | TEXT | Action type (create, update, delete) | |
| resource_type | TEXT | Type of resource modified | |
| resource_id | TEXT | ID of the resource modified | |
| details | JSONB | Additional details about the change | |
| ip_address | TEXT | IP address of the user | |
| timestamp | TIMESTAMP WITH TIME ZONE | When the action occurred | DEFAULT NOW() |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp | DEFAULT NOW() |

## Entity Relationship Diagram

```
projects 1--* project_phases *--1 phases
project_phases 1--* project_tasks *--1 tasks
projects *--1 new_customers
projects *--1 locations
```

## Indexes

| Table | Index Name | Columns | Type |
|-------|------------|---------|------|
| projects | idx_projects_customer_id | customer_id | BTREE |
| project_phases | idx_project_phases_project_id | project_id | BTREE |
| project_tasks | idx_project_tasks_project_phase_id | project_phase_id | BTREE |

## Notes on Schema Evolution

1. The `projects` table should be used as the primary table for all project data
2. The `customer_id` column in the `projects` table is a foreign key to the `new_customers` table
3. All new projects should be created with both a `project_name` and a `customer_id`

## Migration Path

To ensure database consistency, follow these steps when making schema changes:

1. Create a migration script in the `/migrations` directory
2. Document the changes in this schema file
3. Update any affected utility functions
4. Run tests to ensure compatibility

## Known Issues

1. There is currently a duplicate table (`new_projects`) that should be consolidated with the main `projects` table
2. Some projects may be missing the `customer_id` field which is now required