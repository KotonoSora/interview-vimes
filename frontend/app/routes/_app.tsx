// app/routes/_app.tsx
import { Outlet } from "react-router";

import { Header } from "~/components/layout/header";
import { Sidebar } from "~/components/layout/sidebar";

export default function AppLayout() {
  return (
    <div className="flex w-full min-h-screen">
      {/* 1. Sidebar cố định bên trái (CSS Print sẽ tự ẩn khi in chứng từ A4) */}
      <Sidebar />

      {/* 2. Cột nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header trên cùng */}
        <Header />

        {/* Vùng hiển thị động cho từng screen */}
        <main className="flex-1 bg-muted/20 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
