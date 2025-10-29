// 📁 application/character/SearchCharacterUseCase.ts
import { ICharacterGateway } from '@/domain/gateways';

export class SearchCharacterUseCase {
  constructor(private readonly gateway: ICharacterGateway) {}

  async execute(nick: string, date: string | null = null) {
    // 1. 닉네임으로 캐릭터 찾기
    const character = await this.gateway.getCharacterByNickname(nick);

    // 2. 여러 데이터 조회
    const data = await this.gateway.getCharacterData(
      character.getOcid(),
      ['basic', 'ability', 'propensity', 'symbol-equipment', 'item-equipment', 'stat', 'hyper-stat', 'set-effect'],
      date,
    );

    return { character, data };
  }
}
