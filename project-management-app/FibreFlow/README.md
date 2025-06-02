# FiberFlow - Enterprise Fiber Project Management System

## 🚀 **THE CORE FOCUS: Advanced 4-Level Project Hierarchy**

FiberFlow is an enterprise-grade project management system specifically designed for fiber optic infrastructure deployment. At its core is a sophisticated **4-level hierarchical structure** (Projects → Phases → Steps → Tasks) with industry-specific workflows, drag-and-drop management, and comprehensive automation.

### **🎯 Primary Mission**
Transform fiber project management through an intelligent hierarchical system that manages the complete lifecycle from planning to final acceptance, reducing project completion time by 20% and improving on-time delivery to 95%.

### **📊 Core Hierarchy System**
```
Projects (Fiber Deployments)
├── Phases (6 Industry Standards: Planning, IP, WIP, Handover, HOC, FAC)
    ├── Steps (Civils, Optical, Testing, Documentation)
        └── Tasks (Pole Permissions, Trenching, Cable Laying, etc.)
```

**[See Full Project Hierarchy Specification →](./PROJECT-HIERARCHY-SPEC.md)**  
**[See Implementation Plan →](./IMPLEMENTATION-PLAN.md)**

---

This is a [Next.js](https://nextjs.org) project with advanced project management capabilities.

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
- **PowerBI-like Analytics Dashboard:**
  - Interactive data visualization with multiple chart types
  - Project, task, location, and audit analytics
  - Real-time performance monitoring
  - Customizable filters and date ranges
  - Feature flag controlled deployment
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
- **Performance Optimization System:**
  - Feature flag system for safe parallel development
  - React Query integration for optimized data caching
  - Real-time performance monitoring and metrics collection
  - Automated benchmark testing for optimization validation
  - Browser DevTools integration for detailed performance analysis
  - Analytics dashboard performance tracking

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

### **🎯 PRIORITY 1: Core Hierarchy System**
| Feature                          | Status        | Priority |
|----------------------------------|--------------|----------|
| **4-Level Hierarchy (P→P→S→T)** | **In Progress** | **CRITICAL** |
| **6 Industry Phases**            | **Next Sprint** | **CRITICAL** |
| **Drag-Drop Management**         | **Next Sprint** | **CRITICAL** |
| **Dynamic CRUD Operations**      | **Next Sprint** | **CRITICAL** |
| **Workflow Automation Engine**   | **Planned**     | **HIGH** |
| **Resource Management**          | **Planned**     | **HIGH** |

### **Standard Features**
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
| PowerBI-like Analytics Dashboard | Implemented  |
| Performance Optimization System  | Implemented  |
| Feature Flag Management          | Implemented  |
| Real-time Collaboration          | Optional     |
| Notifications/Activity Feed      | Optional     |
| Import/Export Data               | Optional     |
| Mapping API Integration          | Optional     |
| **GraphRAG Intelligence System** | **Planned**  |
| **AI-Ready Architecture**        | **Planned**  |

## **🤖 AI-Ready Project Management Architecture**

### **Making FiberFlow Work Perfectly with AI Assistants**

FiberFlow is being designed from the ground up to work seamlessly with AI assistants like Claude, ChatGPT, and future AI tools. This isn't just about adding AI features - it's about building a system that AI can understand, interact with, and enhance.

#### **The Simple Value Proposition**
Instead of building just another project management tool, we're building one that **works perfectly with AI assistants**:
- **AI can actually help** manage projects (not just chat about them)
- **Fewer project failures** through smart guardrails
- **Less manual oversight** needed from managers
- **Faster issue resolution** with AI assistance

#### **Core AI-Ready Features**

1. **Clear Rules Instead of Vague Guidelines**
   - Explicit business rules AI can enforce
   - Structured workflows AI can monitor
   - Automatic alerts when rules are violated

2. **Structured Data That AI Can Read**
   - All project data in AI-friendly formats
   - Standardized status enums and field types
   - Clear relationships between entities

3. **Built-in Safety Checks**
   - Validation rules prevent invalid states
   - Business logic constraints enforced at database level
   - AI can't accidentally break critical workflows

#### **Practical Example**
```
Without AI-Ready Design:
Manager: "Claude, what's the status of the fiber rollout in Cape Town?"
Claude: "I don't have access to your project data."

With AI-Ready Design:
Manager: "Claude, what's the status of the fiber rollout in Cape Town?"
Claude: "The Cape Town project is 87% complete. Current blocker: Permit approval 
delayed by 3 days. I've identified 2 similar past projects where we fast-tracked 
permits - would you like me to apply those lessons?"
```

See [`AI-READY-GUIDE.md`](./AI-READY-GUIDE.md) for complete implementation details.

## **🚀 GraphRAG Intelligence System - Next Major Feature**

**Absolutely! GraphRAG could be incredibly beneficial for your FiberFlow project management app.** This system will transform your project intelligence capabilities by creating a knowledge graph from your project data and enabling natural language queries.

### **How GraphRAG Transforms FiberFlow**

#### **Current Capabilities:**
- Projects, phases, tasks in relational database
- Basic reporting and analytics dashboard
- Standard queries like "show all active projects"

#### **GraphRAG Enhanced Capabilities:**
- **Complex Relationship Queries**: "Which projects share similar resource constraints as the delayed Cape Town deployment?"
- **Intelligent Insights**: "What factors typically lead to fiber installation delays based on historical patterns?"
- **Natural Language Interface**: Users ask questions in plain English, get AI-powered answers
- **Pattern Recognition**: Identify success patterns and risk factors across project history
- **Predictive Analytics**: Early warning systems for potential project issues

### **FiberFlow-Specific Use Cases**

#### **1. Project Intelligence & Pattern Recognition**
```
User Query: "Why are our Johannesburg projects consistently delayed?"

GraphRAG Response: "Analysis shows Johannesburg projects are delayed due to three factors: 
municipal permit delays (average 2 weeks), material shortages affecting contractor efficiency, 
and seasonal weather patterns during Q2-Q3 affecting outdoor installations."
```

#### **2. Resource Optimization**
```
User Query: "Which teams should I assign to the new Durban fiber rollout?"

GraphRAG Response: "Team Alpha (led by Sarah) excels in coastal installations with 95% 
on-time completion. They successfully completed similar projects in Port Elizabeth and East London."
```

#### **3. Risk Prediction & Mitigation**
```
User Query: "What risks should I watch for in the upcoming Pretoria project?"

GraphRAG Response: "Similar projects show high correlation between underground utilities 
conflicts and 3-week delays. Projects in established suburbs require additional utility mapping."
```

### **Implementation Roadmap**

#### **Phase 1: Knowledge Graph Foundation (Week 1)**
- Set up Neo4j database integration with Supabase
- Create LLM entity extraction for projects, tasks, locations, teams, materials
- Transform existing project data into knowledge graph format
- Define node types: Project, Location, Team, Task, Material, Issue, Stakeholder
- Define relationships: LOCATED_AT, ASSIGNED_TO, DEPENDS_ON, CAUSED_BY, RESOLVED_BY

#### **Phase 2: Natural Language Query Interface (Week 2)**
- Create Cypher query generation for project management questions
- Build few-shot prompts for fiber optic project domain
- Integrate with existing dashboard for natural language search
- Enable intelligent project queries and recommendations

#### **Phase 3: Intelligent Insights & Predictions (Week 3)**
- Implement pattern recognition across project history
- Create predictive analytics using graph relationships
- Build automated risk assessment based on project similarities
- Generate optimization recommendations for resource allocation
- Add intelligent project planning assistance

### **Expected ROI & Benefits**

#### **For Project Managers:**
- **40-60% faster project planning** with AI-powered recommendations
- **Risk prediction** with early warning systems
- **Data-driven resource allocation** based on proven success patterns

#### **For Field Teams:**
- **Contextual guidance**: "Projects like this usually require X, Y, Z"
- **Intelligent troubleshooting**: "Similar issues were resolved by..."
- **Best practices** automatically suggested based on successful projects

#### **For Executives:**
- **Strategic insights** through pattern analysis across all projects
- **Performance analytics** explaining regional/team performance differences
- **Investment planning** with data-driven expansion recommendations

### **Technical Integration Strategy**

The GraphRAG system will integrate seamlessly with your existing:
- ✅ **Performance Infrastructure**: React Query handles complex GraphRAG queries efficiently
- ✅ **Feature Flags**: Safe rollout of GraphRAG features
- ✅ **Analytics Dashboard**: Natural language query interface
- ✅ **Audit System**: Track GraphRAG insights and recommendations

This feature could be the differentiator that sets FibreFlow apart from all other project management platforms in the market!

---

See [`plan.md`](../plan.md) for the full feature and style specification and detailed project roadmap with implementation status.

---

## 🤖 Claude Code Development Patterns

### Optimized for AI-Assisted Development

FibreFlow follows specific patterns optimized for development with Claude Code and other AI assistants:

#### **Quick Start for Claude Code**
When starting a session, always provide this context:
```
I'm working on FibreFlow with these constraints:
- Stack: Next.js + Supabase + Tailwind + React Query
- Performance: < 50ms response times required
- All new features need feature flags
- Current performance: 92-93% optimized
```

#### **Binary Rules for Consistency**
- **ALWAYS**: Use React Query for server state, include TypeScript types, test with feature flags OFF
- **NEVER**: Use useState for server data, skip error boundaries, expose internal IDs

#### **Clear Success Criteria**
Every feature must meet:
- ✅ Response time < 50ms
- ✅ Works with feature flag OFF
- ✅ Includes error handling
- ✅ TypeScript types complete
- ✅ Follows existing patterns

See [`CLAUDE-ENGINEERING-GUIDE.md`](./CLAUDE-ENGINEERING-GUIDE.md) for complete prompt engineering principles and [`DEVELOPMENT_GUIDE.md`](./DEVELOPMENT_GUIDE.md) for Claude-optimized patterns.

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

## Usage: Performance Optimization
- Navigate to **Admin > Performance** to access the performance dashboard
- **Real-time Monitoring:** View live performance metrics as you use the app

## Usage: Analytics Dashboard
- Navigate to **Analytics > Dashboard** to access the main analytics dashboard
- Use the navigation at the top to switch between different analytics views:
  - **Dashboard:** Overview of all key metrics
  - **Projects:** Detailed analysis of project performance and distribution
  - **Tasks:** Analysis of task completion rates and distribution
  - **Locations:** Geographic analysis of projects and tasks
  - **Audit Trail:** Analysis of system activity and user actions
- Use the filter panel to customize the data view by date range, project, location, and more
- Performance monitoring is available in the bottom right corner when enabled via feature flags
- **Feature Flags:** Toggle optimizations on/off via **Admin > Feature Flags**
- **Benchmark Testing:** Click "Run Benchmark" to compare optimized vs baseline performance
- **DevTools Integration:** 
  - Open browser DevTools (F12) → Network tab to see request timings
  - Look for React Query DevTools icon (bottom-right) when optimizations are enabled
  - Check console for performance logs marked with ⚡ symbols
- **Performance Features:**
  - React Query for data caching and deduplication
  - Optimized database queries for faster response times
  - Error boundaries for better error isolation
  - Memory usage and network request monitoring

## Usage: Feature Flags
- Navigate to **Admin > Feature Flags** to manage optimization features
- **Safe Development:** All flags disabled by default to ensure stability
- **Testing Progress:** Visual progress indicator shows which optimizations are active
- **Available Flags:**
  - Performance Monitoring: Track baseline metrics
  - React Query: Enable data caching
  - Optimized Project Queries: Faster project data fetching
  - Optimized Task Queries: Faster task data fetching
  - Error Boundaries: Better error handling
- **Testing Protocol:** Always test with flags OFF before merging code

---

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
