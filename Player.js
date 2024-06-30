export default class Player {
  static ID = 0
  id
  name
  team
  score
  justScored
  roundsParticipatedIn

  constructor(
    name,
    team = 0,
    score = 0,
    justScored = false,
    roundsParticipatedIn = 0,
    id
  ) {
    this.name = name
    this.team = team
    this.score = score
    this.justScored = justScored
    this.roundsParticipatedIn = roundsParticipatedIn
    if (id !== undefined) {
      this.id = id
    } else {
      this.id = Player.ID
      Player.ID++
    }
  }
}
