export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center w-full h-full p-10">
      <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to FiberFlow</h1>
      <p className="text-lg text-gray-300 mb-8 max-w-2xl text-center">
        FiberFlow is your modern project management platform for fiber deployment and infrastructure projects. Track progress, manage materials, collaborate with your team, and visualize your workflow—all in one place.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        <FeatureCard title="Dashboard" href="/dashboard" desc="Project overview, stats, and quick links."/>
        <FeatureCard title="Kanban Board" href="/kanban" desc="Visualize and manage project tasks."/>
        <FeatureCard title="Gantt Chart" href="/gantt" desc="Timeline view for project planning."/>
        <FeatureCard title="Grid View" href="/grid" desc="Spreadsheet-style data management."/>
        <FeatureCard title="Materials" href="/materials" desc="Track site materials and stock."/>
        <FeatureCard title="Auth" href="/auth" desc="User login, registration, and roles."/>
      </div>
      <div className="mt-10 text-gray-500 text-sm text-center max-w-xl">
        <p>Use the sidebar to navigate between features. For help, see the README or project plan.</p>
      </div>
    </section>
  );
}

function FeatureCard({ title, href, desc }: { title: string; href: string; desc: string }) {
  return (
    <a
      href={href}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col hover:bg-gray-800 transition group shadow-md"
    >
      <h2 className="text-xl font-semibold mb-2 text-primary group-hover:underline">{title}</h2>
      <p className="text-gray-400 text-base">{desc}</p>
    </a>
  );
}
