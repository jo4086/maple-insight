import { CharacterEndpoint, Character } from '../character';

export interface ICharacterGateway {
  getCharacterByNickname(nick: string): Promise<Character>;
  getCharacterData(
    ocid: string,
    endpoints: CharacterEndpoint[],
    date?: string | null,
  ): Promise<Record<CharacterEndpoint, unknown>>;
}
