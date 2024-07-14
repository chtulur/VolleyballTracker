import Global from './Global.js'
import Render from './Render.js'
import LocalStorage from './LocalStorage.js'

const Evaluator = (() => {
  let winnersStay = true

  const evaluate = (top, bottom) => {
    let duplicates = []
    let hierarchy = [
      top.players[0],
      top.players[1],
      bottom.players[0],
      bottom.players[1],
    ]

    hierarchy.sort((playerA, playerB) => playerB.score - playerA.score)
    hierarchy.forEach((player, i) => {
      if (i < 3 && player.score === hierarchy[i + 1].score)
        duplicates.push(player.score)
    })

    let secondStrongest = hierarchy[1]
    let weakest = hierarchy[hierarchy.length - 1]
    let winningTeam = Global.getCurrentTeams().find(team => team.justScored)
    let losingTeam = Global.getCurrentTeams().find(
      team =>
        team.teamNumber === hierarchy.find(player => !player.justScored).team
    )

    let threeEqualsSituation =
      duplicates.length === 2 && duplicates[0] === duplicates[1]
    let isPairPairSituation =
      duplicates.length === 2 && duplicates[0] !== duplicates[1]
    let scoreDifference =
      winningTeam.calculateTeamScore() - losingTeam.calculateTeamScore()
    let isScoreDiffMoreThanOne = scoreDifference > 1
    let losingTeamWeakest = Math.min(
      losingTeam.players[0].score,
      losingTeam.players[1].score
    )
    let winningTeamWeakest = Math.min(
      winningTeam.players[0].score,
      winningTeam.players[1].score
    )
    let winningTeamStrongest = Math.max(
      winningTeam.players[0].score,
      winningTeam.players[1].score
    )

    if (
      threeEqualsSituation &&
      isScoreDiffMoreThanOne &&
      winningTeamStrongest > winningTeamWeakest
    ) {
      oneTeamLeavesTheField(top, bottom, !winnersStay)
    } else if (
      (isPairPairSituation && isScoreDiffMoreThanOne) ||
      (duplicates.length < 2 && //one pair and no pair situations
        isScoreDiffMoreThanOne &&
        losingTeamWeakest !== winningTeamWeakest)
    ) {
      if (
        //SPECIAL CASE
        (hierarchy[3].score < hierarchy[2].score && //weakest player and the
          hierarchy[0].score > hierarchy[1].score && //and the strongest
          hierarchy[0].team === hierarchy[3].team) || //are in the same team
        (hierarchy[0].score === hierarchy[1].score && //or the two strongest have
          (hierarchy[1].team === hierarchy[3].team || //the same score
            hierarchy[0].team === hierarchy[3].team)) // and either are in the same team as the weakest
        //and they lost. We know that because of isScoreDiffMoreThanOne
      ) {
        oneTeamLeavesTheField(top, bottom, !winnersStay)
      } else if (
        hierarchy[3].score === hierarchy[2].score &&
        hierarchy[3].team !== hierarchy[2].team
      ) {
        //the two weakest players have the same score and are not in the same team, it makes no sense to swap.
      } else {
        secondStrongest = winningTeam.determineWeakerPlayer()
        weakest = losingTeam.determineWeakerPlayer()

        swapTeam(secondStrongest, weakest)
        oneTeamLeavesTheField(top, bottom, !winnersStay)
      }
    } else {
      oneTeamLeavesTheField(top, bottom, winnersStay)
    }

    Render.renderTeamTable()

    //reset justScored
    top.resetJustScored()
    bottom.resetJustScored()

    LocalStorage.setTeams()
    LocalStorage.setPlayers()
  }

  const swapTeam = (secondStrongest, weak) => {
    let strongsTeam = Global.getCurrentTeams().find(
      team => team.teamNumber === secondStrongest.team
    )
    let strongIndex = strongsTeam.players.indexOf(secondStrongest)

    let weaksTeam = Global.getCurrentTeams().find(
      team => team.teamNumber === weak.team
    )
    let weakIndex = weaksTeam.players.indexOf(weak)

    weak.team = secondStrongest.team
    secondStrongest.team = weaksTeam.teamNumber

    strongsTeam.players[strongIndex] = weak
    weaksTeam.players[weakIndex] = secondStrongest

    alert(
      'SWAP!! \n' +
        secondStrongest.name +
        ' <--> ' +
        weak.name +
        '\nStrong: ' +
        strongsTeam.players[0].name +
        ' | ' +
        strongsTeam.players[1].name +
        '.\nWeak: ' +
        weaksTeam.players[0].name +
        ' | ' +
        weaksTeam.players[1].name
    )
  }

  // TODO: I have to rethink this to make this more reusable for skipping a turn.
  const oneTeamLeavesTheField = (top, bottom, doesWinnerStay) => {
    let leavingTeam

    if (top.justScored) {
      leavingTeam = doesWinnerStay ? bottom : top
    } else {
      leavingTeam = doesWinnerStay ? top : bottom
    }

    leavingTeam.teamMovesOffTheField()
    nextTeam(leavingTeam)
    alert(
      'Leave: ' +
        leavingTeam.players[0].name +
        ' | ' +
        leavingTeam.players[1].name +
        '\n Next: ' +
        Global.getCurrentTeams()[1].players[0].name +
        ' | ' +
        Global.getCurrentTeams()[1].players[1].name +
        '. \n'
    )
    Render.renderField(Global.getCurrentTeams()[0], Global.getCurrentTeams()[1])
  }

  const nextTeam = previousTeam => {
    let index = Global.getCurrentTeams().indexOf(previousTeam)

    if (index === 0) {
      Global.getCurrentTeams().push(Global.getCurrentTeams().shift())
    } else {
      let stayingTeam = Global.getCurrentTeams().shift()
      let leavingTeam = Global.getCurrentTeams().shift()

      Global.getCurrentTeams().push(leavingTeam)
      Global.getCurrentTeams().unshift(stayingTeam)
    }

    Global.getCurrentTeams()[0].side === 'top'
      ? Global.getCurrentTeams()[1].takeTopSide()
      : Global.getCurrentTeams()[1].takeBottomSide()

    Global.getCurrentTeams()[1].teamMovesOnTheField() //we know for sure it's the second team
  }

  // Public API
  return {
    get winnersStay() {
      return winnersStay
    },
    set winnersStay(value) {
      winnersStay = value
    },
    evaluate,
    swapTeam,
    oneTeamLeavesTheField,
    nextTeam,
  }
})()

export default Evaluator
