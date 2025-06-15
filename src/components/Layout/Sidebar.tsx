import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Home, ClipboardList, PackageOpen, 
  BarChart2, FileText, Settings, Receipt, Users, Database, Shield
} from 'lucide-react';
import { useAppContext } from '../../utils/context/AppContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-teal-100 text-teal-700' 
            : 'text-gray-600 hover:bg-gray-100'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="ml-3 font-medium">{label}</span>}
    </NavLink>
  );
};

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  collapsed: boolean;
}

const NavSection: React.FC<NavSectionProps> = ({ title, children, collapsed }) => {
  return (
    <div className="mb-6">
      {!collapsed && (
        <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppContext();
  
  return (
    <aside 
      className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      } z-20`}
    >
      <div className="flex flex-col h-full">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-200`}>
          {!sidebarCollapsed && <h2 className="font-bold text-xl text-teal-800">MR Medical</h2>}
          <button 
            className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <NavSection title="General" collapsed={sidebarCollapsed}>
            <NavItem 
              to="/" 
              icon={<Home className="h-5 w-5" />} 
              label="Dashboard" 
              collapsed={sidebarCollapsed} 
            />
            <NavItem 
              to="/billing" 
              icon={<Receipt className="h-5 w-5" />} 
              label="Billing" 
              collapsed={sidebarCollapsed} 
            />
            <NavItem 
              to="/inventory" 
              icon={<PackageOpen className="h-5 w-5" />} 
              label="Inventory" 
              collapsed={sidebarCollapsed} 
            />
          </NavSection>
          
          <NavSection title="Transactions" collapsed={sidebarCollapsed}>
            <NavItem 
              to="/sales" 
              icon={<ClipboardList className="h-5 w-5" />} 
              label="Sales" 
              collapsed={sidebarCollapsed} 
            />
            <NavItem 
              to="/purchases" 
              icon={<ClipboardList className="h-5 w-5" />} 
              label="Purchases" 
              collapsed={sidebarCollapsed} 
            />
          </NavSection>
          
          <NavSection title="Reporting" collapsed={sidebarCollapsed}>
            <NavItem 
              to="/gst-reports" 
              icon={<FileText className="h-5 w-5" />} 
              label="GST Reports" 
              collapsed={sidebarCollapsed} 
            />
            <NavItem 
              to="/reports" 
              icon={<BarChart2 className="h-5 w-5" />} 
              label="Reports" 
              collapsed={sidebarCollapsed} 
            />
          </NavSection>
          
          <NavSection title="Management" collapsed={sidebarCollapsed}>
            <NavItem 
              to="/customers" 
              icon={<Users className="h-5 w-5" />} 
              label="Customers" 
              collapsed={sidebarCollapsed} 
            />
            <NavItem 
              to="/suppliers" 
              icon={<Users className="h-5 w-5" />} 
              label="Suppliers" 
              collapsed={sidebarCollapsed} 
            />
            <NavItem 
              to="/backup" 
              icon={<Database className="h-5 w-5" />} 
              label="Backup" 
              collapsed={sidebarCollapsed} 
            />
          </NavSection>
          
          <NavSection title="Admin" collapsed={sidebarCollapsed}>
            <NavItem 
              to="/settings" 
              icon={<Settings className="h-5 w-5" />} 
              label="Settings" 
              collapsed={sidebarCollapsed} 
            />
            <NavItem 
              to="/users" 
              icon={<Shield className="h-5 w-5" />} 
              label="Users" 
              collapsed={sidebarCollapsed} 
            />
          </NavSection>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;