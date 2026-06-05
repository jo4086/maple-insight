import { useNavigate } from 'react-router-dom';

import { Container } from '@/components/ui';
import { CharacterSearchInput } from '@/features/character';

export const Header = () => {
  const navigate = useNavigate();
  return (
    <Container
      className="
      flex w-full
      border
      px-0
      "
    >
      <div
        className="
        flex justify-between items-center
        w-full m-auto
        border
        "
      >
        <div className="cursor-pointer border flex self-stretch items-center justify-center w-30" onClick={() => navigate('/')}>
          Logo
        </div>
        <CharacterSearchInput />
      </div>
    </Container>
  );
};
