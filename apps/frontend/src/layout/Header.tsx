import { Container } from '@/components/ui';
import { CharacterSearchInput } from '@/features/character/components/CharacterSearchInput';

export function Header() {
  return (
    <Container
      className="
      flex justify-center items-center
      border
      p-4
      "
    >
      <CharacterSearchInput />
    </Container>
  );
}
