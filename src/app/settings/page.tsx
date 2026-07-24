import { SiteHeader } from "@/components/layout/SiteHeader";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default function SettingsPage() {
  return (
    <main className="figma-main">
      <div className="figma-shell dashboard-page settings-page">
        <SiteHeader />
        <SettingsClient />
      </div>
    </main>
  );
}
