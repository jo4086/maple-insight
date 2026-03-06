import { Outlet } from 'react-router-dom';

export function Main() {
  return (
    <div className="min-h-lvh">
      <Outlet />
    </div>
  );
}
