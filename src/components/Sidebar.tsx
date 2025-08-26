import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
      <nav className="flex flex-col gap-2">
        <SidebarLink href="/dashboard" icon={<span>🏠</span>} text="Dashboard" />
        <SidebarLink href="/dashboard/bookings" icon={<span>📅</span>} text="Bookings" />
        <SidebarLink href="/dashboard/tours" icon={<span>🗺️</span>} text="Tours" />
        <SidebarLink href="/dashboard/users" icon={<span>👤</span>} text="Users" />
        <SidebarLink href="/dashboard/settings" icon={<span>⚙️</span>} text="Settings" />
      </nav>
    </aside>
  );

}

function SidebarLink({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 transition-colors sidebar-link">
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{text}</span>
    </Link>
  );
}
