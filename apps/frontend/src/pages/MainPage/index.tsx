import { HexagonChart, type HexnagonChartItemProps } from '@/components/ui/HexagonChart';
import { useSearchNick } from '@/features/character/hooks/useSearchNick';
import { useCharacterSearchStore } from '@/features/character/store/characterSearchStore';

export function MainPage() {
  const submittedNick = useCharacterSearchStore((state) => state.submittedNick);
  const { data: response, isPending, isError, error } = useSearchNick(submittedNick);

  console.log(response);

  const basic = response?.basic;
  const ability = response?.ability;
  const propensity = response?.propensity;

  const propensityData: HexnagonChartItemProps[] = [
    {
      vertex_name: '카리스마',
      value: propensity?.charisma_level ?? 0,
      max_value: 100,
    },
    {
      vertex_name: '손재주',
      value: propensity?.handicraft_level ?? 0,
      max_value: 100,
    },
    {
      vertex_name: '통찰력',
      value: propensity?.insight_level ?? 0,
      max_value: 100,
    },
    {
      vertex_name: '의지',
      value: propensity?.willingness_level ?? 0,
      max_value: 100,
    },
    {
      vertex_name: '감성',
      value: propensity?.sensibility_level ?? 0,
      max_value: 100,
    },
    {
      vertex_name: '매력',
      value: 40,
      // value: propensity?.charm_level ?? 0,
      max_value: 100,
    },
  ];

  return (
    <div className="flex flex-col max-w-[1080px] m-auto">
      <div className="flex w-full border h-60">
        <div className="h-full aspect-square border">
          <div className="bg-[length:170%] bg-center h-full" style={{ backgroundImage: `url(${basic?.character_image})` }}></div>
        </div>

        <div className="flex h-auto flex-1 border m-2"></div>
      </div>

      <div className="w-[300px] border h-[100px]">
        <p>
          {basic?.character_name} ({basic?.character_guild_name})
        </p>
        <p>{basic?.character_class}</p>
        <p>{basic?.world_name}</p>
        <p>
          {basic?.character_exp.toLocaleString('ko-KR')} ({basic?.character_exp_rate}%)
        </p>
      </div>
      <img className="border w-100" src={basic?.character_image} />

      <div className="flex flex-col border rounded-md w-fit p-2">
        {ability?.ability_info.map((i) => {
          return (
            <div className="w-90 border rounded-md my-[1.5px] p-0.5" key={i.ability_no}>
              {i.ability_value}
            </div>
          );
        })}
      </div>

      <HexagonChart values={propensityData} />
    </div>
  );
}
