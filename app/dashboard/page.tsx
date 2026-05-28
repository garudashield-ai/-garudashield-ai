// new release garudashield source
import { getAllReports } from "@/lib/db";
import { DashboardView } from "@/components/DashboardView";
export default async function DashboardPage() {
  const reports = await getAllReports();
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <DashboardView reports={reports} />
      </div>
    </div>
  );
}
