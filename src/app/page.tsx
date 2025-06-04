export default function Home() {
  return (
    <div className="ff-page-container">
      <div className="ff-page-header text-center">
        <h1 className="ff-page-title">Welcome to FibreFlow</h1>
        <p className="ff-page-subtitle">
          Your modern project management platform for fiber deployment and infrastructure projects. Track progress, manage materials, collaborate with your team, and visualize your workflow—all in one place.
        </p>
      </div>
      
      <section className="ff-section">
        <h2 className="ff-section-title text-center">Platform Features</h2>
        <div className="ff-grid-cards">
          <FeatureCard title="Dashboard" href="/dashboard" desc="Project overview, stats, and quick links."/>
          <FeatureCard title="Kanban Board" href="/kanban" desc="Visualize and manage project tasks."/>
          <FeatureCard title="Gantt Chart" href="/gantt" desc="Timeline view for project planning."/>
          <FeatureCard title="Grid View" href="/grid" desc="Spreadsheet-style data management."/>
          <FeatureCard title="Materials" href="/materials" desc="Track site materials and stock."/>
          <FeatureCard title="Authentication" href="/auth" desc="User login, registration, and roles."/>
        </div>
      </section>
      
      <div className="text-center">
        <p className="ff-secondary-text">Use the sidebar to navigate between features. For help, see the README or project plan.</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, href, desc }: { title: string; href: string; desc: string }) {
  return (
    <a
      href={href}
      className="ff-card group cursor-pointer"
    >
      <h3 className="ff-card-title group-hover:text-blue-600">{title}</h3>
      <p className="ff-card-content">{desc}</p>
    </a>
  );
}
