import { AdminClient } from "@/components/admin/AdminClient";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function AdminPage() {
  return (
    <main>
      <SiteHeader />
      <section className="admin-page-shell" aria-label="관리자">
        <AdminClient />
      </section>
    </main>
  );
}
