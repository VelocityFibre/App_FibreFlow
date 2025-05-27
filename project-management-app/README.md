This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Core Features
- Project Kanban board
- Interactive Gantt charts
- User roles & authentication
- Project filtering & search
- AI-powered task sequencing
- Project steps & workflow tracking
- Site materials management
- Responsive dashboard
- **Spreadsheet-style Data Grid:**
  - View, filter, and edit live data from any table (e.g., projects, customers, materials)
  - Switch tables instantly with the table selector
  - Edit cells and save changes directly to Supabase
  - Export table to CSV
  - Bulk delete selected rows

### Optional Advanced Features
- Real-time collaboration
- In-app notifications and activity feed
- Import/export project data (CSV, PDF)
- Integration with mapping APIs for site visualization

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
| Project Steps/Workflow Tracking  | Planned      |
| Site Materials Management        | Planned      |
| Responsive Dashboard             | Planned      |
| Spreadsheet-style Data Grid      | Implemented  |
| Real-time Collaboration          | Optional     |
| Notifications/Activity Feed      | Optional     |
| Import/Export Data               | Optional     |
| Mapping API Integration          | Optional     |

See [`FiberFlow-Project-Plan.md`](../FiberFlow-Project-Plan.md) for the full feature and style specification.

---

## Usage: Data Grid
- Go to the **Grid** page from the sidebar.
- Use the table selector to choose which table to view (projects, customers, etc).
- Edit any cell (except the ID column) and your changes will be saved automatically to Supabase.
- Use the filter and sort controls in the grid header for advanced data exploration.
- Export the current table to CSV with the "Export CSV" button.
- Select multiple rows and use "Delete Selected" for bulk deletion.

---

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
