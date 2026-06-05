import { Outlet } from 'react-router-dom';

const Main = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`mx-auto flex w-full flex-1 flex-col ${className}`.trim()}>
      <Outlet />
    </div>
  );
};

export default Main;
