import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RiderRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  const role = userInfo?.role?.toLowerCase();
  if (role === 'rider' || role === 'admin') return <Outlet />;

  if (userInfo) return <Navigate to="/" replace />;
  return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
};

export default RiderRoute;
