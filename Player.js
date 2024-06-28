export default class Player {
  static ID = 0
  id
  name
  team
  score = 0
  justScored = false

  constructor(name) {
    this.name = name
    this.team = 0
    this.id = Player.ID
    Player.ID++
  }
}
