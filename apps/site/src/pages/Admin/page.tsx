// import { useState } from 'react';
import { Outlet } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';

export const AdminRoot = () => {
  // const location = useLocation();

  return (
    <div className="flex-1 bg-gray-100 overflow-y-auto">
      <Outlet />
    </div>
  );
};

export { default as DashBoard } from './DashBoard';
