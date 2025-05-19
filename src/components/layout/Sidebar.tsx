import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, Users, BookOpen, BarChart3, User } from 'lucide-react';
import { useStore } from '../../store/store';

const Sidebar: React.FC = () => {
  const { user } = useStore();
  
  const links = [
    { to: '/record', label: 'Practice', icon: <Mic className="h-5 w-5" /> },
    { to: '/community', label: 'Community', icon: <Users className="h-5 w-5" /> },
    { to: '/journal', label: 'Journal', icon: <BookOpen className="h-5 w-5" /> },
    { to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  return (
    <div className="h-full py-8 flex flex-col">
      <div className="px-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user?.username}</p>
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3 text-secondary" />
              <span className="text-xs text-muted-foreground">Streak: {user?.streakCount || 0} days</span>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`
                }
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="px-6 pt-6 mt-auto">
        <div className="rounded-md bg-accent/10 p-4">
          <h4 className="font-medium text-accent mb-1">Daily Tip</h4>
          <p className="text-sm text-foreground">
            Try recording in a quiet space to focus on your pronunciation and reduce distractions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;