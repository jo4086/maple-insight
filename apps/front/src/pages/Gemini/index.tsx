import { NavBar, Popover } from '../../components';
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

  return (
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
  );
};
