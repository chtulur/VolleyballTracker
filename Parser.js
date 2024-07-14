import Team from './Team.js'
import Player from './Player.js'
import Global from './Global.js'

const Parser = (() => {
  const teamParser = parse => {
    Global.setCurrentTeams([])

    parse.forEach(team => {
      const player1 = Global.getCurrentPlayers().find(
        player => player.id === team.players[0].id
      )
      const player2 = Global.getCurrentPlayers().find(
        player => player.id === team.players[1].id
      )
      let newTeam = Team.createTeam({
        playerI: player1,
        playerII: player2,
        teamNumber: team.teamNumber,
        side: team.side,
        active: team.active,
        justScored: team.justScored,
        teamScore: team.teamScore,
      })
      Global.addTeam(newTeam)
    })
  }

  const playerParser = parse => {
    Global.setCurrentPlayers([])

    parse.forEach(player => {
      Global.getCurrentPlayers().push(
        Player.createPlayer({
          name: player.name,
          team: player.team,
          score: player.score,
          justScored: player.justScored,
          roundsParticipatedIn: player.roundsParticipatedIn,
          id: player.id,
        })
      )
    })
  }

  // Public API
  return {
    teamParser,
    playerParser,
  }
})()

export default Parser
