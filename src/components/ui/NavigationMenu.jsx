import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './sidebar';
import { Home, FileText, MessageSquare, BarChart3, Building2, CreditCard, Settings, Sparkles } from 'lucide-react';

function NavigationMenu({ collapsed = false, onNavigate }) {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  // Navigation items with consistent icons and improved organization
  const navigationItems = [
    // Primary group
    { name: 'Dashboard', path: '/dashboard', icon: Home, roles: ['admin', 'member'], description: 'Overview and insights', group: 'primary' },
    { name: 'Documents', path: '/dashboard/documents', icon: FileText, roles: ['admin', 'member'], description: 'Manage knowledge base', group: 'primary' },
    { name: 'Chatbots', path: '/dashboard/chatbots', icon: MessageSquare, roles: ['admin', 'member'], description: 'Create and manage bots', group: 'primary' },
    // Admin group
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3, roles: ['admin'], description: 'Performance metrics', badge: 'Soon', group: 'admin' },
    { name: 'Company', path: '/dashboard/company', icon: Building2, roles: ['admin'], description: 'Organization settings', group: 'admin' },
    { name: 'Subscription', path: '/dashboard/subscription', icon: CreditCard, roles: ['admin'], description: 'Billing and plans', group: 'admin' },
    // Settings group
    { name: 'Settings', path: '/dashboard/settings', icon: Settings, roles: ['admin', 'member'], description: 'Account preferences', group: 'settings' },
  ];

  // Filter based on user role
  const filteredNavItems = navigationItems.filter(item => item.roles.includes(user?.role || 'member'));

  // Group items logically
  const groupedItems = filteredNavItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  // Check if route is active
  const isActiveRoute = (itemPath) => {
    if (itemPath === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(itemPath);
  };

  // Helper to render group headers
  const renderGroupHeader = (groupName, IconComponent) => (
    !collapsed && (
      <div className={`
        px-3 py-1 mb-1 text-xs font-semibold uppercase tracking-wide flex items-center
        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
      `}>
        <IconComponent className="w-4 h-4 mr-2" />
        {groupName}
      </div>
    )
  );

  return (
    <div className="px-4 pt-4 space-y-3">
      <SidebarMenu className="space-y-1.5">
        {/* Primary Group */}
        {groupedItems.primary && (
          <>
            {renderGroupHeader('Core', Home)}
            {groupedItems.primary.map((item) => renderMenuItem(item, theme, collapsed, isActiveRoute, onNavigate))}
          </>
        )}

        {/* Admin Group (with spacing if present) */}
        {groupedItems.admin && (
          <div className={collapsed ? '' : 'mt-3'}>
            {renderGroupHeader('Admin', Building2)}
            <div className={collapsed ? '' : 'space-y-1.5'}>
              {groupedItems.admin.map((item) => renderMenuItem(item, theme, collapsed, isActiveRoute, onNavigate))}
            </div>
          </div>
        )}

        {/* Settings Group (with spacing if present) */}
        {groupedItems.settings && (
          <div className={collapsed ? '' : 'mt-3'}>
            {renderGroupHeader('Account', Settings)}
            <div className={collapsed ? '' : 'space-y-1.5'}>
              {groupedItems.settings.map((item) => renderMenuItem(item, theme, collapsed, isActiveRoute, onNavigate))}
            </div>
          </div>
        )}
      </SidebarMenu>

      {/* Upgrade prompt for non-admin users */}
      {!collapsed && user?.role !== 'admin' && (
        <div className={`
          mt-6 p-2.5 rounded-xl border-2 border-dashed transition-all duration-200 group hover:scale-[1.02]
          ${theme === 'dark' 
            ? 'border-gray-600 bg-gradient-to-br from-purple-900/20 to-blue-900/20' 
            : 'border-gray-300 bg-gradient-to-br from-purple-50 to-blue-50'
          }
        `}>
          <div className="text-center space-y-1">
            <Sparkles className={`
              w-8 h-8 mx-auto
              ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
            `} />
            <h4 className={`
              font-semibold text-sm
              ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}
            `}>
              Unlock Premium
            </h4>
            <p className={`
              text-xs
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Access analytics, settings, and more
            </p>
            <Link
              to="/dashboard/subscription"
              className={`
                block w-full py-1.5 px-3 text-xs font-medium rounded-lg transition-all duration-200
                ${theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                }
              `}
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* Footer to match screenshot */}
      {!collapsed && (
        <div className={`mt-4 px-3 py-2 text-xs text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>© 2025 Axion</span>
          <span className="inline-block w-1.5 h-1.5 ml-1 bg-red-500 rounded-full" /> {/* Placeholder for red dot */}
        </div>
      )}
    </div>
  );
}

// Updated helper function to render each menu item (with fixes for clipping/overlapping)
function renderMenuItem(item, theme, collapsed, isActiveRoute, onNavigate) {
  const Icon = item.icon;
  const isActive = isActiveRoute(item.path);

  return (
    <SidebarMenuItem key={item.name} className="my-1">
      <Link
        to={item.path}
        onClick={onNavigate}
        className="block w-full focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
        aria-label={`Navigate to ${item.name}: ${item.description}`}
      >
        <SidebarMenuButton
          isActive={isActive}
          className={`
            group relative w-full flex items-center px-3 py-3 min-h-[60px] text-sm leading-relaxed rounded-md
            transition-all duration-200 ease-in-out
            ${isActive
              ? theme === 'dark'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-blue-50 text-blue-700 shadow-sm'
              : theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
            }
            ${collapsed ? 'justify-center' : 'justify-start'}
          `}
          title={`${item.name}: ${item.description}`}
        >
          <Icon className={`
            w-5 h-5 flex-shrink-0 transition-all duration-200 group-hover:scale-105
            ${isActive 
              ? theme === 'dark' ? 'text-white' : 'text-blue-700'
              : theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-700'
            }
            ${collapsed ? '' : 'mr-3'}
          `} />
          
          {!collapsed && (
            <div className="flex flex-col space-y-0.5 flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span className={`
                    ml-2 px-1.5 py-0.5 text-xs rounded-full font-medium shrink-0
                    ${theme === 'dark' 
                      ? 'bg-purple-900/50 text-purple-300' 
                      : 'bg-purple-100 text-purple-700'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p className={`
                  text-[11px] transition-opacity duration-200 group-hover:opacity-100 opacity-70
                  ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
                  ${isActive ? 'opacity-60' : ''}
                `}>
                  {item.description}
                </p>
              )}
            </div>
          )}
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

export default NavigationMenu;