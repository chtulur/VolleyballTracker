export default class Team {
  players = []
  side
  teamNumber
  active = false
  justScored = false
  teamScore = 0

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

  calculateTeamScore() {
    return this.players[0].score + this.players[1].score
  }

  takeTopSide() {
    this.side = 'top'
  }

  takeBottomSide() {
    this.side = 'bottom'
  }

  participate() {
    this.players.forEach(player => player.roundsParticipatedIn++)
  }
}
