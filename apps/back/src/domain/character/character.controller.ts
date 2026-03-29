import characterService, { getCharacterOCID } from './character.service';
import { CharacterService } from './refactor.service';

/* const searchNick: AppHandler<object, unknown, unknown, { nick: string; date?: string | null }> = async (req, res) => {
  try {
    const { nick, date = null } = req.query;
    // console.log(req.query);
    // const nick = req.query.nick;

    const data = await characterService.getInfo(nick, date);

    // console.log('data:', data);

    return res.status(200).json({
      success: true,
      data,
      status: '200',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      status: 'Internal Server Error (500)',
      message: '캐릭터 ocid 조회 중 오류 발생',
    });
  }
};
 */
// const characterController = { searchNick };

const lookup: AppHandler<object, unknown, unknown, { nick: string; date?: string | null }> = async (req, res) => {
  try {
    const { nick, date = null } = req.query;
    const { ocid } = await getCharacterOCID(nick);

    const service = new CharacterService(ocid, date);

    const data = await service.getMultipleWithDelay([
      'basic',
      'ability',
      'propensity',
      'symbol-equipment',
      'item-equipment',
      'stat',
      'hyper-stat',
      'set-effect',
      'hexamatrix-stat',
      'other-stat',
      'ring-reserve-skill-equipment',
      'cashitem-equipment',
    ]);

    console.log(data);

    return res.status(200).json({
      success: true,
      data,
      status: '200',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      status: 'Internal Server Error (500)',
      message: '캐릭터 ocid 조회 중 오류 발생',
    });
  }
};

const characterController = { lookup };
export default characterController;

// export default characterController;
