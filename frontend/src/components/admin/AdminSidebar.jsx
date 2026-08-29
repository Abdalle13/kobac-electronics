import React from 'react';
import { PieChart, Package, ShoppingBag, Users, DollarSign, Settings, LogOut, XCircle } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const NAV = [
  { id: 'overview', icon: PieChart, label: 'Overview' },
  { id: 'products', icon: Package, label: 'Products' },
  { id: 'orders', icon: ShoppingBag, label: 'Orders' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'finance', icon: DollarSign, label: 'Payments' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, userInfo, onLogout }) => (
  <>
    {isOpen && (
      <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[65]" onClick={() => setIsOpen(false)} />
    )}

    <aside
      className={`fixed inset-y-0 left-0 z-[70] lg:relative lg:inset-auto lg:z-10 w-72 bg-surface border-r border-line
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="h-16 lg:h-20 px-6 flex items-center justify-between border-b border-line shrink-0">
        <div>
          <span className="text-lg font-black tracking-tighter text-fg">KOBAC <span className="text-primary">Electronics</span></span>
          <p className="text-[10px] text-muted font-bold tracking-[0.25em] uppercase mt-0.5">Admin Suite</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 text-muted hover:text-fg transition-all">
          <XCircle size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em] mb-3 px-2">Navigation</p>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1024) setIsOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted hover:text-fg hover:bg-surface-2 border border-transparent'
              }`}
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                activeTab === item.id ? 'bg-primary/15' : 'bg-surface-2 group-hover:bg-primary/10'
              }`}>
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-primary' : 'text-muted group-hover:text-primary'}`} />
              </span>
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="px-4 pb-3 shrink-0">
        <div className="flex items-center gap-3 bg-surface-2 border border-line rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-black text-sm shrink-0 overflow-hidden">
            {userInfo?.image
              ? <img src={userInfo.image} alt={userInfo.name} className="w-full h-full object-cover" />
              : userInfo?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-fg truncate">{userInfo?.name || 'Admin'}</p>
            <p className="text-xs text-muted truncate">{userInfo?.email || ''}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="px-4 pb-5 pt-2 border-t border-line shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all group text-danger/70 hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/15"
        >
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-surface-2 group-hover:bg-danger/10 transition-colors">
            <LogOut className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </aside>
  </>
);

export default AdminSidebar;
