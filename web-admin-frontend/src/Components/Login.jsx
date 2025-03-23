import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Assets/LankaLottoLogo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          if (username && password) {
            resolve({
              ok: true,
              json: async () => ({ message: 'Login successful' }),
            });
          } else {
            resolve({
              ok: false,
              json: async () => ({ message: 'Username and password are required' }),
            });
          }
        }, 1000);
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        alert('Login successful! Redirecting to Admin Dashboard...');
        navigate('/admin-dashboard');
      } else {
        const errorMessage = data.message || 'Unknown error occurred';
        console.error('Login failed:', errorMessage);
        alert('Login failed: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  return (
    <div className="bg-gradient-to-r from-blue-200 to-blue-500 min-h-screen flex items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start mb-8 md:mb-0">
          <h1 className="text-5xl font-bold text-black mb-8">Welcome Back</h1>
          <div className="flex flex-col items-center">
            <div className="bg-yellow-300 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-2 relative">
              <div className="w-20 h-20 flex items-center justify-center">
                <img
                  src={logo}
                  alt="Lanka Lotto Logo"
                  className="w-full h-full object-contain"
                  onError={handleLogoError}
                />
                {logoError && (
                  <div className="absolute w-20 h-20 flex items-center justify-center">
                    <div className="w-full h-full border-2 border-blue-900 rounded-full flex items-center justify-center">
                      <div className="w-3/4 h-3/4 border-2 border-blue-900 rounded-full"></div>
                    </div>
                    <div className="absolute w-full h-full">
                      <div className="absolute w-full h-0.5 bg-blue-900 top-1/2 left-0 transform -translate-y-1/2"></div>
                      <div className="absolute w-0.5 h-full bg-blue-900 top-0 left-1/2 transform -translate-x-1/2"></div>
                      <div className="absolute w-full h-0.5 bg-blue-900 top-1/2 left-0 transform -translate-y-1/2 rotate-45"></div>
                      <div className="absolute w-0.5 h-full bg-blue-900 top-0 left-1/2 transform -translate-x-1/2 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-blue-900 mb-1">Lanka Lotto</h2>
            <p className="text-blue-900 text-sm">Check Your Tickets Instantly</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-300">
            <h2 className="text-2xl font-bold text-center mb-2">Login</h2>
            <p className="text-center text-gray-700 mb-6">Please Sign In to continue</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="username" className="block text-gray-700 mb-2">User Name</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-8">
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    disabled={loading}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-gray-500`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;