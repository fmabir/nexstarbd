import type { Viewport } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import styles from "@/components/admin/admin.module.css";

// Admin sits on its own off-white page, so the browser chrome matches it.
export const viewport: Viewport = {
  themeColor: "#f5f8fc",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session");
  if (!session?.value) {
    redirect("/login");
  }

  return (
    <div className={`${styles.root} flex flex-col lg:flex-row`}>
      {/* Desktop: left sidebar */}
      <AdminSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Phones and tablets: top bar + section pills */}
        <AdminMobileNav />

        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
