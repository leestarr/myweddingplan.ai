import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  DocumentIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const mainNavigation = [
  { name: 'Dashboard', href: '/app', icon: HomeIcon },
  { name: 'Guest List', href: '/app/guests', icon: UserGroupIcon },
  { name: 'Tasks', href: '/app/tasks', icon: ClipboardDocumentListIcon },
  { name: 'AI Chat', href: '/app/chat', icon: ChatBubbleLeftIcon },
  { name: 'Documents', href: '/app/documents', icon: DocumentIcon },
];

const projectNavigation = [
  { name: 'Budget', href: '/app/budget', icon: CurrencyDollarIcon },
  { name: 'Expenses', href: '/app/expenses', icon: BanknotesIcon },
  { name: 'Vendors', href: '/app/vendors', icon: BuildingStorefrontIcon },
  { name: 'Quotes', href: '/app/quotes', icon: DocumentTextIcon },
];

const resourceNavigation = [
  { name: 'Wedding Forum', href: '/app/forum', icon: ChatBubbleLeftRightIcon },
  { name: 'Wedding Store', href: '/app/store', icon: ShoppingBagIcon },
];

const bottomNavigation = [
  { name: 'Profile', href: '/app/profile', icon: UserCircleIcon },
  { name: 'Settings', href: '/app/settings', icon: Cog6ToothIcon },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">MYweddingplan.ai</h1>
      </div>

      <div className="flex-1 flex flex-col px-4 py-4 space-y-8 overflow-y-auto">
        {/* Main Menu */}
        <div>
          <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            MAIN MENU
          </h2>
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            PLANNING
          </h2>
          <div className="space-y-1">
            {projectNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div>
          <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            RESOURCES
          </h2>
          <div className="space-y-1">
            {resourceNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto">
          <div className="space-y-1">
            {bottomNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
