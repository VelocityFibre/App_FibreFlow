# Velocity Fibre Project Management App – Development Plan

## Objective

To create a robust, modular, and automation-ready app that streamlines project execution for Velocity Fibre — ensuring transparency, accountability, and data-driven management across all project phases.

---

## 1. Customer & Project Setup *(IMPLEMENTED)*

- Customers can be created and managed individually. *(IMPLEMENTED)*
- Each customer can have multiple projects. *(IMPLEMENTED)*
- Each project is assigned a unique ID, location, and start date, and is linked to a customer. *(IMPLEMENTED)*

## 2. Project Workflow & Task Management *(IN PROGRESS)*

### a. Phased Workflow Structure *(IN PROGRESS)*

- Projects progress through sequential phases (Planning, Kickoff, Civils, Build, Splicing, Testing, Handover, Maintenance).
- Each phase unlocks only after all tasks in the previous phase are completed.
- Tasks in future phases remain locked until the current phase is complete.
- **Automatic Phase Initialization:** First phase and its tasks are automatically created when a project is created. *(IN PROGRESS)*

### b. Task Assignment & Tracking *(NEXT PRIORITY)*

- Each task includes assignee, due date, status (not started/in-progress/complete), and completion tracking.
- Visual progress tracker displays completed, in-progress, and outstanding tasks per phase.
- All task actions are logged in the audit trail for accountability.
- **Automatic Task Assignment:** Project manager can be assigned during project creation and will automatically receive the first task. *(NEXT PRIORITY)*
- **Staff Assignment Dashboard:** Project managers can view all assigned tasks and delegate them to appropriate staff members. *(NEXT PRIORITY)*
- **Sequential Task Progression:** When one task is completed, the next task in sequence is automatically activated and assigned. *(NEXT PRIORITY)*

### c. Task Notifications & Reporting

- **Daily Assignee Reminders:** Automated emails with outstanding tasks and due dates.
- **Daily Management Reports:** Summary of all outstanding tasks across teams.
- **Weekly Progress Reports:** Tasks completed and still outstanding from the past week.
- **Implementation:** Scheduled via Supabase Edge Functions with email integration.

## 3. Bill of Quantities (BOQ) Management *(PLANNED)*

- BOQ split into Labor Deliverables and Material Requirements.
- Project-specific BOQs display only items with quantity > 0.
- Labor deliverables include standardized units (Pole Permissions, Poles Planted, Meters Trenched, Meters Fibre Strung).

## 4. Contractor KPI Tracking *(PLANNED)*

- Contractors assigned to specific projects and phases.
- Performance tracking includes:
  - Deliverables completed vs BOQ
  - Completion percentage
  - Accumulated totals
- Reports available per contractor, per project, and as global dashboards.

## 5. Supplier & RFQ Automation *(PLANNED)*

- Automated RFQ generation for all BOQ items.
- Supplier quote submission via standardized form.
- Quote comparison tools for:
  - Cheapest overall supplier
  - Cheapest per-item pricing
  - Price vs quality scoring (future AI enhancement)

## 6. Audit Trail & Compliance *(IMPLEMENTED)*

- Comprehensive audit logging of all system actions. *(IMPLEMENTED)*
- Tracking of who created/modified data, when, and what changed. *(IMPLEMENTED)*
- Filterable audit log viewer for administrators. *(IMPLEMENTED)*
- Support for compliance requirements and accountability. *(IMPLEMENTED)*

## 7. Dashboards & Reporting *(PLANNED)*

- Real-time dashboards for:
  - Project phase progress
  - Contractor performance metrics
  - Procurement efficiency
  - BOQ fulfillment status
- Exportable reports for stakeholders and clients.

---

*This plan serves as a reference for development milestones and feature measurement. For tailored versions (e.g., Airtable, Notion, React+Firebase, Zoho Creator), contact the COO or product owner.*
