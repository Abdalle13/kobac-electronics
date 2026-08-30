import React from 'react';
import { PieChart, Package, ShoppingBag, Users, DollarSign, Settings, Star, FileText, LogOut, XCircle } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const NAV = [
  { id: 'overview', icon: PieChart, label: 'Overview' },
  { id: 'products', icon: Package, label: 'Products' },
  { id: 'orders', icon: ShoppingBag, label: 'Orders' },
  { id: 'reviews', icon: Star, label: 'Reviews' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'finance', icon: DollarSign, label: 'Payments' },
  { id: 'report', icon: FileText, label: 'Report' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, userInfo, onLogout }) => (
  <>
    {isOpen && (
      <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[65]" onClick={() => setIsOpen(false)} />
    )}

    <aside
      className={`fixed inset-y-0 left-0 z-[70] lg:relative lg:inset-auto lg:z-10 w-[80%] max-w-xs lg:w-64 bg-surface border-r border-line
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="h-16 lg:h-20 px-5 flex items-center justify-between border-b border-line shrink-0">
        <div>
          <span className="text-base font-bold tracking-tight text-fg">KOBAC <span className="text-primary">Electronics</span></span>
          <p className="text-[11px] text-muted mt-0.5">Admin</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 text-muted hover:text-fg transition-all">
          <XCircle size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1024) setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:text-fg hover:bg-surface-2'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${activeTab === item.id ? 'text-primary' : 'text-muted'}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="px-3 pb-3 shrink-0">
        <div className="flex items-center gap-3 bg-surface-2 border border-line rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-sm shrink-0">
            {userInfo?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-fg truncate">{userInfo?.name || 'Admin'}</p>
            <p className="text-xs text-muted truncate">{userInfo?.email || ''}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="px-3 pb-4 pt-2 border-t border-line shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Log out
        </button>
      </div>
    </aside>
  </>
);

export default AdminSidebar;
