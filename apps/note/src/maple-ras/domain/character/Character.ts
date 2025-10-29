export class Character {
  constructor(
    private readonly ocid: string,
    private readonly nickname: string,
  ) {}

  getOcid() {
    return this.ocid;
  }

  getNickname() {
    return this.nickname;
  }
}
