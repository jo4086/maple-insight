export const calcSkillDelay = (delay: number, atkSpeed: number = 2) => {
  // console.log(Math.round((delay * (atkSpeed + 10)) / 16 / 30) * 30);
  return Math.round((delay * (atkSpeed + 10)) / 16 / 30) * 30;
};

calcSkillDelay(1380, 2);
