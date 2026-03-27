import { Outlet } from 'react-router-dom';

export function Main() {
  return (
    <div className="min-h-lvh flex flex-col max-w-[1080px] m-auto border">
      <Outlet />
    </div>
  );
}
