import Global from './Global.js'

const Team = (() => {
  const createTeam = ({
    playerI,
    playerII,
    teamNumber = 0,
    side = '',
    active = false,
    justScored = false,
    teamScore = 0,
    players = [],
  }) => {
    if (players.length === 0) {
      players.push(playerI)
      players.push(playerII)
    }

    const activateTeam = () => {
      team.active = true
    }

    const deactivateTeam = () => {
      team.active = false
    }

    const score = () => {
      players.forEach(player => {
        player.score++
        player.justScored = true
      })
      team.justScored = true
    }

    const resetJustScored = () => {
      players.forEach(player => (player.justScored = false))
      team.justScored = false
    }

    const calculateTeamScore = () => {
      return players[0].score + players[1].score
    }

    const takeTopSide = () => {
      team.side = 'top'
    }

    const takeBottomSide = () => {
      team.side = 'bottom'
    }

    const participate = () => {
      players.forEach(player => player.roundsParticipatedIn++)
    }

    const findPlayer = name => {
      return players.find(player => player.name === name)
    }

    const teamMovesOffTheField = () => {
      team.side = ''
      deactivateTeam()
    }

    const teamMovesOnTheField = () => {
      Global.getCurrentTeams()[0].side === 'top'
        ? takeBottomSide()
        : takeTopSide()

      activateTeam()
    }

    const determineWeakerPlayer = () => {
      if (players[0].score > players[1].score) {
        return players[1]
      } else if (players[0].score < players[1].score) {
        return players[0]
      } else {
        return Math.random() <= 0.5 ? players[0] : players[1]
      }
    }

    const team = {
      players,
      teamNumber,
      side,
      active,
      justScored,
      teamScore,
      activateTeam,
      deactivateTeam,
      score,
      resetJustScored,
      calculateTeamScore,
      takeTopSide,
      takeBottomSide,
      participate,
      findPlayer,
      teamMovesOffTheField,
      teamMovesOnTheField,
      determineWeakerPlayer,
    }

    return team
  }

  return {
    createTeam,
  }
})()

export default Team
