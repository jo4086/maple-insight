import type { JSX } from 'react';

const NotFoundPage = (): JSX.Element => {
  return (
    <div className="flex min-h-lvh items-center justify-center">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
    </div>
  );
};

export default NotFoundPage;
