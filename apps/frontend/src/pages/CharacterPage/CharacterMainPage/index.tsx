import { useSearchParams } from 'react-router-dom';

import { CharacterBanner } from '@/features/character/components/CharacterBanner';
import { useSearchNick } from '@/features/character/hooks/useSearchNick';

export function CharacterMainPage() {
  const [searchParams] = useSearchParams();
  const nick = searchParams.get('nick')?.trim() ?? '';

  const { data, isPending, isError, error } = useSearchNick(nick);

  if (!nick) {
    return <div> 닉네임을 검색해주세요. </div>;
  }

  if (isPending) {
    return <div> 캐릭터 정보를 조회중...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="flex w-full flex-col">
      <CharacterBanner data={data} />
      <div>{data?.basic.world_name}</div>
    </div>
  );
}
