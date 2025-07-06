import characterService from './character.service';

const searchNick: AppHandler<object, unknown, unknown, { nick: string }> = async (req, res) => {
  try {
    // console.log(req.query);
    const nick = req.query.nick;

    const data = await characterService.getInfo(nick);

    console.log('data:', data);

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

const characterController = { searchNick };

export default characterController;
