import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-fhj-cream md:flex-row">
      <AdminNav />
      <div className="flex-1 overflow-x-auto p-6 md:p-10">{children}</div>
    </div>
  );
}
