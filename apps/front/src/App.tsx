// File: App.tsx

import { Layout } from './__TEST__/components/layouts';
import { categories } from './__TEST__/constants';

import { DynamicFab } from '@/components';
import { UploadModalProvider } from '@/components/shared/UploadModalProvider';
import { AppRoutes } from '@/router';

const App = () => {
  return (
    <UploadModalProvider>
      <Layout>
        <DynamicFab categories={categories} defaultCategoryId="admin" />
        <AppRoutes />
      </Layout>
    </UploadModalProvider>
  );
};

export default App;
