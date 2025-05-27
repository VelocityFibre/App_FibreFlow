import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/kanban', label: 'Kanban' },
  { href: '/gantt', label: 'Gantt' },
  { href: '/grid', label: 'Grid' },
  { href: '/materials', label: 'Materials' },
  { href: '/auth', label: 'Auth' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-8">FiberFlow</h1>
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hover:bg-gray-800 px-3 py-2 rounded text-lg transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
