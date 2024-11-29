import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';

export default function TopBar() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between">
      {/* Left side */}
      <div className="flex items-center flex-1">
        <div className="max-w-xl w-full">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <BellIcon className="h-6 w-6 text-gray-500" />
        </button>
        <div className="flex items-center space-x-3">
          <img
            src="https://ui-avatars.com/api/?name=Wedding+Planner"
            alt="Profile"
            className="h-8 w-8 rounded-full"
          />
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-700">Wedding Planner</div>
            <div className="text-xs text-gray-500">@planner</div>
          </div>
        </div>
      </div>
    </header>
  );
}
