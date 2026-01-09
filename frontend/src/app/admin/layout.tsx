import { Metadata } from "next";
import Link from "next/link";
import { Home, Activity, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | Bridgestone Ukraine",
  description: "Content automation dashboard",
};

const navItems = [
  { href: "/admin/automation", label: "Automation", icon: Activity },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="border-b border-border bg-white dark:bg-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/automation" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                B
              </div>
              <span className="font-semibold">Admin Dashboard</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Main Site
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
