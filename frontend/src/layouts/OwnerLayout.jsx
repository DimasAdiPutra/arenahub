import { Outlet } from 'react-router';
import OwnerSidebar from '../components/OwnerSidebar';

export default function OwnerLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans antialiased text-slate-800">
      <OwnerSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}