export default class Team {
  players = []
  side
  teamNumber
  active = false
  justScored = false

  constructor(playerI, playerII, teamNumber) {
    this.teamNumber = teamNumber
    this.players.push(playerI)
    this.players.push(playerII)
    this.players.map(player => (player.team = teamNumber))
  }

  activateTeam() {
    this.active = true
  }

  deactivateTeam() {
    this.active = false
  }

  score() {
    this.players.map(player => {
      player.score++
      player.justScored = true
    })
    this.justScored = true
  }

  resetJustScored() {
    this.players.map(player => (player.justScored = false))
    this.justScored = false
  }
}
