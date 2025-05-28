This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.17.0 or later)
- [npm](https://www.npmjs.com/) (v9.6.7 or later)
- [Git](https://git-scm.com/) (for cloning the repository)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VelocityFibre/App_FibreFlow.git
   cd App_FibreFlow/project-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Running the Development Server

#### On Linux/macOS:
```bash
npm run dev
```

#### On Windows:
```cmd
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000) (or another port if 3000 is in use).

### Initial Setup

After starting the application for the first time:

1. Visit the **Admin > Phases & Tasks** page to initialize project phases and tasks.
2. Click the "Setup Default Phases & Tasks" button to create the default project phases (Planning, Design, Implementation, Testing, Deployment) and associated tasks.
3. You can then create projects with an assigned project manager. The first phase and its tasks will be automatically assigned to the project manager.

## Core Features
- Project Kanban board
- Interactive Gantt charts
- User roles & authentication
- Project filtering & search
- AI-powered task sequencing
- Project steps & workflow tracking
- Site materials management
- Responsive dashboard
- **Enhanced Project Management:**
  - Projects with start dates and location assignments
  - Location-based project organization
  - Date-based project planning and tracking
  - Phased project workflow with automatic phase assignment
  - Default tasks for each project phase
  - Automatic task assignment to project managers
  - Sequential task activation based on completion
  - Task reassignment and completion tracking
  - My Tasks page for staff to manage their assigned tasks
- **Spreadsheet-style Data Grid:**
  - View, filter, and edit live data from any table (e.g., projects, customers, materials)
  - Switch tables instantly with the table selector
  - Edit cells and save changes directly to Supabase
  - Export table to CSV
  - Bulk delete selected rows
- **Full CRUD Pages:**
  - **Customers:** Manage customer records (add, edit, delete, list)
  - **Contacts:** Manage contact details for customers/contractors
  - **Contractors:** Manage contractor information and assignments
  - **Locations:** Manage project and material locations
  - **Materials:** Manage stock items, including add/edit/list
- **Dark Mode Support:**
  - All pages support dark mode for improved readability and accessibility
- **Improved Error Handling & UI Consistency:**
  - Enhanced error messages and consistent user experience across all pages
- **Comprehensive Audit Trail System:**
  - Track all data modifications (create, update, delete)
  - Record user actions with timestamps and details
  - Filterable audit log viewer for administrators
  - Support for compliance and accountability requirements

### Optional Advanced Features
- Real-time collaboration
- In-app notifications and activity feed
- Import/export project data (CSV, PDF)
- Integration with mapping APIs for site visualization

---

## Supabase Backend

All backend/database operations are performed using [Supabase](https://supabase.com/). The app uses Supabase's RESTful API for all CRUD operations (create, read, update, delete) across all entities (projects, customers, materials, etc.).

---

## Branch Protection & Contribution Workflow

- **Main branch is protected:** Direct pushes to `main` are not allowed.
- **Pull requests required:** All changes must be made via a pull request from a feature or fix branch.
- **Code review required:** At least one approval is required before merging.
- **Status checks:** If enabled, at least one status check (such as CI or tests) must pass before merging. If you see an error like `Required status checks cannot be empty`, either select a status check or disable the rule (see Troubleshooting below).
- **Linear history recommended:** All merges should be done via rebase or squash for a clean commit history.

---

## Troubleshooting: Status Checks

If you see the error:

```
Required status checks cannot be empty. Please add at least one status check or disable the rule.
```

This means the branch protection rule "Require status checks to pass before merging" is enabled, but no status checks are configured. To resolve:
- Add a status check (e.g., GitHub Actions workflow) and select it in the rule; **or**
- Disable the "Require status checks" option in the branch protection settings.

---

## Project Structure

```
FibreFlow/
├── src/
│   ├── app/           # Next.js app directory
│   │   ├── kanban/    # Kanban board feature
│   │   ├── gantt/     # Gantt chart feature
│   │   ├── grid/      # Data grid (spreadsheet view)
│   │   ├── materials/ # Materials management
│   │   ├── dashboard/ # Main dashboard
│   │   ├── auth/      # Auth pages
│   ├── components/    # Reusable UI components (Sidebar, ThemeToggle, etc.)
│   ├── lib/           # Supabase client and utilities
├── public/            # Static assets
├── .env.example       # Example environment variables
├── README.md          # Project documentation
├── FiberFlow-Project-Plan.md # Full feature and style spec
```

---

## Supabase & Database Setup

1. **Create a Supabase project** at https://supabase.com.
2. **Configure environment variables** in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key
   - (Optional for admin/server): `SUPABASE_SERVICE_KEY`
3. **Recommended tables:**
   - `projects`, `customers`, `materials`, `stock_items`, `stock_movements`, `contractors`, `contacts`, `sheq`, `meeting_summaries`
4. **Row Level Security (RLS):**
   - Enable RLS for secure client-side access.
   - Define policies for user roles (see below).

---

## User Roles & Permissions

- **Admin:** Full access to all features and data.
- **Project Manager:** Can create/edit projects, tasks, and materials; limited user management.
- **Team Member:** Can view and update assigned tasks, log materials usage.
- **Viewer:** Read-only access to project data and dashboards.

Role-based access is enforced via Supabase policies and (optionally) in-app logic.

---

## Feature Roadmap & Status

| Feature                          | Status        |
|----------------------------------|--------------|
| Kanban Board                     | Planned      |
| Gantt Chart                      | Planned      |
| User Roles & Auth                | Planned      |
| Project Filtering/Search         | Planned      |
| AI Task Sequencing               | Planned      |
| Project Steps/Workflow Tracking  | Implemented  |
| Automatic Phase/Task Assignment  | Implemented  |
| Task Management & Reassignment   | Implemented  |
| Site Materials Management        | Planned      |
| Responsive Dashboard             | Planned      |
| Enhanced Project Management      | Implemented  |
| Comprehensive Audit Trail        | Implemented  |
| Spreadsheet-style Data Grid      | Implemented  |
| Real-time Collaboration          | Optional     |
| Notifications/Activity Feed      | Optional     |
| Import/Export Data               | Optional     |
| Mapping API Integration          | Optional     |

See [`plan.md`](../plan.md) for the full feature and style specification and detailed project roadmap with implementation status.

---

## Usage: Data Grid
- Go to the **Grid** page from the sidebar.
- Use the table selector to choose which table to view (projects, customers, etc).
- Edit any cell (except the ID column) and your changes will be saved automatically to Supabase.
- Use the filter and sort controls in the grid header for advanced data exploration.
- Export the current table to CSV with the "Export CSV" button.
- Select multiple rows and use "Delete Selected" for bulk deletion.

## Usage: Audit Trail
- Go to the **Admin > Audit Logs** page from the sidebar.
- View all system actions with details about who did what and when.
- Filter logs by:
  - Action type (create, update, delete)
  - Resource type (customer, project, etc.)
  - Date range
- Click "View Details" to see the full information about each action.
- Use for compliance reporting, troubleshooting, and accountability tracking.

## Usage: Project Phases
- When creating a new project, it will automatically be assigned to the first phase (Planning).
- Each phase has default tasks that help track progress.
- The project workflow follows these phases:
  1. Planning - Initial project planning and requirements gathering
  2. Design - Technical design and architecture
  3. Implementation - Development and construction
  4. Testing - Quality assurance and testing
  5. Deployment - Final deployment and handover
- Visit the auto-setup page at `/auto-setup` to initialize these phases and tasks.

---

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
