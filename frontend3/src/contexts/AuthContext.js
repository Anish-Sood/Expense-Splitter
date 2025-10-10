import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000'; // Updated to match Login component
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: token }
        });
        
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  
  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const userToken = response.data.token;
    
    localStorage.setItem('token', userToken);
    setToken(userToken);
    
    const userResponse = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: userToken }
    });
    
    setCurrentUser(userResponse.data);
    return userResponse.data;
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
