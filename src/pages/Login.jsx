import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Ensure your authSlice has an isLoading property, or add it to initial state
  const { user, isError, message, isLoading } = useSelector((state) => state.auth);

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      return toast.error("Please fill in all fields");
    }

    dispatch(loginUser(formData));
  };

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
    if (user) {
      if (user.role === 'teacher') navigate('/teacher-dashboard');
      else navigate('/student-dashboard');
    }
  }, [user, isError, message, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-600">Portal Login</h2>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input 
              type="email" 
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              disabled={isLoading}
            />
          </div>
          <button 
            disabled={isLoading}
            className={`w-full text-white p-2 rounded transition-colors ${
              isLoading ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;