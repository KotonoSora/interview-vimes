import { Outlet } from "react-router";

import { Header } from "~/components/layout/header";
import { Sidebar } from "~/components/layout/sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
