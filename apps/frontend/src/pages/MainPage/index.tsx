import { CharacterSearchInput } from '@/features/character/components/CharacterSearchInput';

export const MainPage = () => {
  // const propensityData: HexnagonChartItemProps[] = [
  //   {
  //     vertex_name: '카리스마',
  //     value: propensity?.charisma_level ?? 0,
  //     max_value: 100,
  //   },
  //   {
  //     vertex_name: '손재주',
  //     value: propensity?.handicraft_level ?? 0,
  //     max_value: 100,
  //   },
  //   {
  //     vertex_name: '통찰력',
  //     value: propensity?.insight_level ?? 0,
  //     max_value: 100,
  //   },
  //   {
  //     vertex_name: '의지',
  //     value: propensity?.willingness_level ?? 0,
  //     max_value: 100,
  //   },
  //   {
  //     vertex_name: '감성',
  //     value: propensity?.sensibility_level ?? 0,
  //     max_value: 100,
  //   },
  //   {
  //     vertex_name: '매력',
  //     value: 40,
  //     // value: propensity?.charm_level ?? 0,
  //     max_value: 100,
  //   },
  // ];
  //
  return (
    <div className="flex flex-col max-w-[1080px] m-auto">
      <CharacterSearchInput />
    </div>
  );
};
