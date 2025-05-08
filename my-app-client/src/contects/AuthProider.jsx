import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
  const AuthProider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optional: Validate token with backend
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);
  
  // Fetch user profile with token
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('token');
        }
      } else {
        console.error("Server returned non-JSON response");
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };
  
  // Email/password login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('token', data.token);
        }
        return data;
      } else {
        throw new Error("Server returned non-JSON response");
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message || "Login failed. Please check your server connection." };
    } finally {
      setLoading(false);
    }
  };
  
  // Create new user with email/password
  const createUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('token', data.token);
        }
        return data;
      } else {
        throw new Error("Server returned non-JSON response. Check if your API server is running.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: error.message || "Signup failed. Please check your server connection." };
    } finally {
      setLoading(false);
    }
  };
  
  // Google login/signup
  const loginWithGoogle = async (token) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('token', data.token);
        }
        return data;
      } else {
        throw new Error("Server returned non-JSON response");
      }
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false, message: error.message || "Google login failed. Please check your server connection." };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      createUser,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProider;
export const useAuth = () => useContext(AuthContext);