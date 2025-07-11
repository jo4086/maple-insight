import { NavBar, Popover, GemimiNav, GeminiPop } from '../../components';
export const Gemini = () => {
  interface ItemProps {
    label: string;
  }

  type ItemMapProps = ItemProps[];

  const ItemMap: ItemMapProps = [
    { label: '아이템1' },
    { label: '아이템2' },
    { label: '아이템3' },
    { label: '아이템4' },
  ];

  const layoutClass = 'flex justify-center items-cemter border border-indogo-300';

  return (
    <>
      {ItemMap.length < 0 && (
        <>
          <NavBar>
            {ItemMap.map((item) => (
              <NavBar.Item key={item.label} label={item.label} />
            ))}
          </NavBar>

          <Popover>
            <Popover.Item label="하이" />
          </Popover>
        </>
      )}

      <GemimiNav className={`${layoutClass} w-full`}>
        {ItemMap.map((item) => (
          <GemimiNav.Item className={`${layoutClass} m-1 p-2 py-4 w-30`} key={item.label} label={item.label}>
            <GeminiPop className={`${layoutClass} flex-col p-0.5 bg-white mt-0.2 w-50 focus:bg-red-200`}>
              <GeminiPop.Item
                className={`${layoutClass} p-1 m-0.5 bg-inhert hover:bg-gray-100`}
                label="팝오버 아이템 1"
              />
              <GeminiPop.Item
                className={`${layoutClass} p-1 m-0.5 bg-inhert hover:bg-gray-100`}
                label="팝오버 아이템 2"
              />
            </GeminiPop>
          </GemimiNav.Item>
        ))}
      </GemimiNav>
    </>
  );
};

