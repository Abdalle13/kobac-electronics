import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  const isAdmin = userInfo && userInfo.role && userInfo.role.toLowerCase() === 'admin';
  if (isAdmin) return <Outlet />;

  // Logged in but not an admin -> send home; not logged in -> login.
  if (userInfo) return <Navigate to="/" replace />;

  const redirect = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/login?redirect=${redirect}`} replace />;
};

export default AdminRoute;
