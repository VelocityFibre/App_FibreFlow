# FibreFlow - Project Management System

FibreFlow is a comprehensive project management system designed for fiber optic installation projects. Built with Next.js, TypeScript, and Supabase, it provides tools for managing projects, phases, tasks, and team assignments.

## Features

- **Project Management**: Create and manage fiber installation projects
- **Phase Workflow**: Organize projects into phases with sequential task management
- **Task Assignment**: Assign tasks and phases to team members
- **Staff Management**: Manage team members and their assignments
- **Audit Logging**: Track all changes with comprehensive audit trails
- **Dark Mode**: Built-in theme support for better user experience
- **Real-time Updates**: Live data synchronization with Supabase

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

### Task Assignment System (May 2025)
- Fixed task assignment dropdown functionality
- Resolved data type mismatches between staff IDs and assignment fields
- Added proper error handling and loading states
- Improved display of assigned staff members (shows names instead of IDs)
- Fixed "NaN" display issue for phase assignments

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