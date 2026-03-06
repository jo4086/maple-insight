import { useLocation, useNavigate } from 'react-router-dom';

import { TabItem } from '@/components/Tabs/TabItem';
import { TabList, Tabs } from '@/components/Tabs/Tabs';
import { paths } from '@/pages';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { label: 'Home', path: paths.home },
    { label: 'Main', path: paths.main },
    { label: 'Example 1', path: paths.example1 },
    { label: 'Example 2', path: paths.example2 },
  ];

  return (
    <div className="w-full border-b border-b-gray-300 text-3xl p-2 m-0 flex items-center">
      <h2 className="px-6 border">RiceMC</h2>
      <Tabs className="w-full flex justify-end" value={location.pathname} onChange={(nextPath) => navigate(String(nextPath))}>
        <TabList className="p-2 flex justify-end gap-2 border rounded-md text-xl w-full">
          {tabs.map((tab) => (
            <TabItem className="border rounded-md min-w-40 hover:bg-amber-100" key={tab.path} value={tab.path}>
              {tab.label}
            </TabItem>
          ))}
        </TabList>
      </Tabs>
    </div>
  );
};

export default Header;
