import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out successfully");
    navigate('/');
  };

  return (
    // Changed bg-blue-600 to bg-purple-500 (Light Purple vibe)
    <nav className="bg-purple-500 text-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Title */}
        <h1 className="text-xl font-bold tracking-wide">
          Assignment Portal
        </h1>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm">{user.name}</p>
              {/* Changed bg-blue-800 to bg-purple-700 */}
              <span className="text-xs bg-purple-700 px-2 py-0.5 rounded uppercase">
                {user.role}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-bold transition duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;