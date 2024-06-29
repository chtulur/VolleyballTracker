export default class Player {
  static ID = 0
  id
  name
  team
  score
  justScored = false
  roundsParticipatedIn = 0

  constructor(name, score = 0) {
    this.name = name
    this.score = score
    this.team = 0
    this.id = Player.ID
    Player.ID++
  }
}
