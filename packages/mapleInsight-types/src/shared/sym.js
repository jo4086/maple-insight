const symbol = {
  symbol_name: '아케인심볼 : 소멸의 여로',
  symbol_icon: 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDJHOA',
  symbol_description:
    '소멸의 여로 지역의 아케인심볼이다. 아케인심볼은 아케인포스를 가지며 소지한 자와 공명하여 해당 캐릭터에 맞는 주스탯을 증가시켜준다.\n\n해당 장비를 장착한 후, 인벤토리 내 같은 종류의 아케인심볼을 더블 클릭하면 성장시킬 수 있다. 아케인심볼의 성장치가 일정 수준 이상이 되면 해당 장비를 강화하여 레벨을 올릴 수 있다.\n\n아케인심볼로 상승하는 스탯은 스탯 % 증가 효과를 받지 않는다.',
  symbol_force: '220',
  symbol_level: 20,
  symbol_str: '0',
  symbol_dex: '0',
  symbol_int: '0',
  symbol_luk: '2200',
  symbol_hp: '0',
  symbol_drop_rate: '0%',
  symbol_meso_rate: '0%',
  symbol_exp_rate: '0%',
  symbol_growth_count: 0,
  symbol_require_growth_count: 411,
};

// const sym = Object.keys(symbol).map((item) => {
//   const parts = item.split('_');
//   return (
//     parts[0].toLowerCase() +
//     parts
//       .slice(1)
//       .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
//       .join('')
//   );
// });

const sym = Object.keys(symbol).map((item) => item.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase()));
console.log(sym);
