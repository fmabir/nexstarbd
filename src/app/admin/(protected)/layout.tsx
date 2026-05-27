import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session");
  if (!session?.value) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col sm:flex-row">
      {/* Desktop: left sidebar | Mobile: hidden */}
      <AdminSidebar />

      {/* Right/main area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile-only top nav */}
        <AdminMobileNav />

        {/* Page content */}
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
