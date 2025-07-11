import { Link } from 'react-router-dom';

import { GeminiPop, GemimiNav } from '../../shared_gemini';

export const Navigation = () => {
  interface ItemProps {
    label: string;
    link: string;
  }

  type ItemMapProps = ItemProps[];

  const ItemMap: ItemMapProps = [
    { label: 'Home', link: '/' },
    { label: 'gemini', link: '/gemini' },
    { label: 'mcp', link: '/mcp' },
    { label: 'crow', link: '/crow' },
    { label: 'user', link: '/user' },
  ];

  const layoutClass = 'flex justify-center items-cemter border border-indogo-300';

  return (
    <GemimiNav className={`${layoutClass} w-full`}>
      {ItemMap.map((item) => (
        <GemimiNav.Item
          className={`${layoutClass} m-1 p-2 py-4 w-30`}
          key={item.label}
          label={<Link to={item.link}>{item.label}</Link>}
        >
          <GeminiPop className={`${layoutClass} flex-col p-0.5 bg-white mt-0.2 w-50 focus:bg-red-200`}>
            <GeminiPop.Item
              className={`${layoutClass} p-1 m-0.5 bg-inherit hover:bg-gray-100`}
              label="팝오버 아이템 1"
            />
            <GeminiPop.Item
              className={`${layoutClass} p-1 m-0.5 bg-inherit hover:bg-gray-100`}
              label="팝오버 아이템 2"
            />
          </GeminiPop>
        </GemimiNav.Item>
      ))}
    </GemimiNav>
  );
};
