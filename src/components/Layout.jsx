import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Navbar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto bg-[#F8F9FE] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
