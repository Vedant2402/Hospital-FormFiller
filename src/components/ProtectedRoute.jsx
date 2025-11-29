import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const docUser = localStorage.getItem('doctorUser');
  if (!docUser) {
    return <Navigate to="/doctor-login" replace />;
  }
  return children;
};

export default ProtectedRoute;
