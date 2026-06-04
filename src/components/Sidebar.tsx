import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  User,
  Settings as SettingsIcon,
  LogOut,
  X,
  Home,
  ListTodo,
  Users,
  Network,
  ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import BrandLogo from './BrandLogo';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const menuItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Actions', path: '/actions', icon: ListTodo },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Org Chart', path: '/org-chart', icon: Network },
    { name: 'Programs', path: '/programs', icon: ClipboardList },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-full md:w-56 lg:w-64 border-r border-outline-variant/20 bg-[var(--ezo-glass-bg)] backdrop-blur-[20px] flex flex-col h-full md:sticky md:top-0 md:self-start md:max-h-dvh md:overflow-y-auto shrink-0">
      <div className="p-4 sm:p-6 border-b border-outline-variant/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo size="sm" />
          <div className="min-w-0">
            <h2 className="font-headline font-semibold text-headline-md truncate text-[var(--ezo-fg)]">
              Enzo
            </h2>
            <span className="text-xs text-on-surface-variant block truncate">
              Enculture Assistant
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-ezo bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-[var(--ezo-fg)] shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-ezo-lg text-sm font-medium transition-all duration-300 border ${
                isActive
                  ? 'nav-link-active'
                  : 'text-on-surface-variant hover:text-[var(--ezo-fg)] hover:bg-surface-container border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 sm:p-4 border-t border-outline-variant/20 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center font-semibold text-primary shrink-0">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-medium truncate text-[var(--ezo-fg)]">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-on-surface-variant truncate">{user.designation}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-ezo-lg text-sm font-medium text-error hover:bg-error-container/30 border border-transparent transition-all duration-300"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
