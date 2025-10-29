import { ICharacterGateway } from '@/domain/gateways';

export class SearchCharacterUseCase2 {
  constructor(private readonly gateway: ICharacterGateway) {}

  async execute(nick: string, date: string | null = null) {
    const character = await this.gateway.getCharacterByNickname(nick);

    const essentialRaw = await this.gateway.getCharacterData(
      character.getOcid(),
      ['basic', 'item-equipment', 'set-effect'],
      date,
    );

    const essential = {
      character,
    };
  }
}
