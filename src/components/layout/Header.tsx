import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Stethoscope, 
  Home, 
  User, 
  Moon, 
  Sun, 
  LogOut,
  Award,
  Users,
  Calendar,
  Settings
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  // Only show header if user is logged in
  if (!user) return null;

  return (
    <header className="bg-gray-800 shadow-lg">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-primary-500" />
              <span className="text-xl font-bold">MedQuiz</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="flex items-center space-x-1 hover:text-primary-400">
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                <Link to="/multiplayer" className="flex items-center space-x-1 hover:text-primary-400">
                  <Users className="h-5 w-5" />
                  <span>Multiplayer</span>
                </Link>
                <Link to="/daily-challenge" className="flex items-center space-x-1 hover:text-primary-400">
                  <Calendar className="h-5 w-5" />
                  <span>Daily Challenge</span>
                </Link>
                <Link to="/leaderboard" className="flex items-center space-x-1 hover:text-primary-400">
                  <Award className="h-5 w-5" />
                  <span>Leaderboard</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {user && (
              <>
                <Link to="/profile" className="flex items-center space-x-1 hover:text-primary-400">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{user.name}</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center space-x-1 hover:text-primary-400">
                    <Settings className="h-5 w-5" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-primary-400"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;