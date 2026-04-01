import { Outlet } from 'react-router-dom';

export const Main = () => {
  return (
    <div className="min-h-lvh flex flex-col m-auto border">
      <Outlet />
    </div>
  );
};
