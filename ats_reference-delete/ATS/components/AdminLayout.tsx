import { Outlet } from "react-router-dom";
import AdminSidebar from "@/ATS/components/AdminSidebar";
import { AtsProvider } from "@/ATS/context/AtsContext";
import GlobalSearch from "@/ATS/components/GlobalSearch";

const AdminLayout = () => {
  return (
    <AtsProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="pl-0 lg:pl-64 transition-all">
          <div className="p-4 pt-16 lg:p-8 lg:pt-8">
            {/* Top bar with global search */}
            <div className="flex items-center justify-end mb-6">
              <GlobalSearch />
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </AtsProvider>
  );
};

export default AdminLayout;
