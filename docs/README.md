# FibreFlow - Project Management System

FibreFlow is a comprehensive project management system designed for fiber optic installation projects. Built with Next.js, TypeScript, and Supabase, it provides tools for managing projects, phases, tasks, and team assignments.

## Features

- **Project Management**: Create and manage fiber installation projects
- **Phase Workflow**: Organize projects into phases with sequential task management
- **Task Assignment**: Assign tasks and phases to team members
- **Staff Management**: Manage team members and their assignments
- **Audit Logging**: Track all changes with comprehensive audit trails
- **Dark Mode**: Built-in theme support for better user experience
- **Project Hierarchy Management**: Complete 4-level structure with visual organization
  - Project → Phases → Steps → Tasks visualization
  - Color-coded status tracking across all levels
  - Phase types: Planning, IP, WIP, Handover, HOC, FAC
  - Automatic progress calculation and rollup
  - Expandable/collapsible hierarchy views
- **Real-time Collaboration**: Live updates, presence tracking, and collaborative editing
  - Live project/task synchronization across all users
  - Presence indicators showing who's viewing/editing what
  - Real-time notifications for assignments and comments
  - Automatic conflict prevention for simultaneous editing
  - Robust reconnection handling
- **Soft Delete System**: Archive/restore functionality with complete audit trails
  - Safe deletion with recovery options across all entity types
  - Bulk archive/restore operations with 100-record safety limits
  - Comprehensive test suite with 9 test scenarios and performance validation
  - Query filtering utilities for archived/active data management
  - Audit logging for all archive operations with detailed change tracking

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks

## Project Structure

```
FibreFlow/
├── project-management-app/     # Main Next.js application
│   ├── src/
│   │   ├── app/               # App router pages
│   │   ├── components/        # Reusable components
│   │   └── lib/              # Utilities and helpers
│   └── public/               # Static assets
├── supabase/                 # Database migrations
└── Various utility scripts   # Database setup and import tools
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- PostgreSQL database (via Supabase)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VelocityFibre/App_FibreFlow.git
   cd FibreFlow
   ```

2. Install dependencies:
   ```bash
   cd project-management-app
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the `project-management-app` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

1. Set your database password:
   - Option 1: Set the `SUPABASE_DB_PASSWORD` environment variable
   - Option 2: Update the connection strings in the utility scripts

2. Run database migrations:
   ```sql
   -- See supabase/migrations/ for migration files
   ```

3. Import initial data (if needed):
   ```bash
   node import-data.js
   ```

## Key Components

### Assignee Dropdowns
- `TaskAssigneeDropdown`: Assign tasks to staff members
- `PhaseAssigneeDropdown`: Assign phases to team members
- `ProjectAssigneeDropdown`: Assign project managers

### Pages
- `/projects`: Project listing and creation
- `/projects/[id]`: Project details with phase and task management
- `/my-tasks`: Personal task dashboard
- `/admin/phases-tasks`: Administrative phase and task management
- `/staff`: Team member management

### Database Schema

Key tables:
- `projects`: Main project information
- `phases`: Project phase definitions
- `project_phases`: Links projects to phases
- `tasks`: Task definitions
- `project_tasks`: Tasks assigned to project phases
- `staff`: Team member information
- `audit_logs`: Change tracking

For detailed schema information, see `project-management-app/SCHEMA.md`

## Recent Updates

### Enhanced Dashboard (January 2025)
- Added comprehensive task statistics showing daily completions and top performers
- Implemented project summaries with current phase and pending task tracking
- Added days-since-assignment tracking with delay indicators
- Fixed table name references (projects vs new_projects)
- Improved data fetching with proper staff member lookups

### Admin Tasks Management Page (January 2025)
- Created comprehensive admin page for viewing all tasks across projects
- Added advanced filtering by assignee, project, and status
- Implemented inline task status and assignee updates
- Added task grouping by assignee with summary statistics

### Automatic Task Progression (January 2025)
- Implemented automatic next task assignment when completing a task
- Added visual indicators for newly assigned tasks
- Fixed task sequence detection for proper workflow progression
- Enhanced My Tasks page with reassignment capabilities

### Task Assignment System (May 2025)
- Fixed task assignment dropdown functionality
- Resolved data type mismatches between staff IDs and assignment fields
- Added proper error handling and loading states
- Improved display of assigned staff members (shows names instead of IDs)
- Fixed "NaN" display issue for phase assignments

### Real-time Collaboration System (May 30, 2025)
- Implemented comprehensive real-time subscription system
- Added presence tracking for live collaboration awareness
- Created smart notification system for task assignments and updates
- Built collaborative editing with conflict prevention
- Added automatic reconnection with exponential backoff
- Integrated with existing React Query patterns for optimistic updates
- Delivered complete integration guide and test suite

### Project Management Hierarchy System (May 30, 2025)
- Implemented complete 4-level hierarchy: Project → Phases → Steps → Tasks
- Created comprehensive UI component library with 6 new components
- Built database schema with migrations and 6 optimized RPC functions
- Added soft delete system with archive/restore functionality
- Implemented color-coded status tracking across all hierarchy levels
- Created phase type system (Planning, IP, WIP, Handover, HOC, FAC)
- Added automatic progress calculation from tasks to project level
- Built expandable/collapsible hierarchy views with mobile responsiveness
- Optimized for current scale (10 projects) with future virtualization planning

### Soft Delete System Enhancement (May 30, 2025)
- **Enhanced Test Suite**: Comprehensive testing framework with 9 test scenarios
  - Basic archive/unarchive operations testing
  - Bulk operations with safety limit validation (100-record max)
  - Query filtering functionality verification (`excludeArchived()`, `onlyArchived()`)
  - Performance testing with <2s benchmarks for 10 records
  - Multi-table support across projects, staff, locations entities
  - Audit log integration verification with change tracking
  - Automated cleanup and test isolation for reliable testing
  - Detailed reporting with timing metrics and failure analysis
- **Test Classes**: `SoftDeleteTestSuite`, `SoftDeleteTestRunner`, `TestDataGenerator`
- **Quick Testing**: Development-friendly quick test functions for rapid validation

### SSH Key Integration
- Added SSH key authentication for GitHub
- Configured Git remote to use SSH instead of HTTPS

## Development

### Running Tests
```bash
cd project-management-app
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See `project-management-app/COLLABORATION.md` for detailed collaboration guidelines.

## Troubleshooting

### Common Issues

1. **Task names showing as IDs**: Ensure the `tasks` table has a `name` field populated
2. **"No staff members available"**: Add staff members to the `staff` table in Supabase
3. **Connection errors**: Check your Supabase URL and anon key in `.env.local`
4. **Assignment not working**: Verify Row Level Security (RLS) policies in Supabase

## License

This project is proprietary to VelocityFibre.

## Contact

For questions or support, please contact the VelocityFibre development team.