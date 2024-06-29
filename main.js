import Player from './Player.js'
import Team from './Team.js'

const playerNameInput = document.querySelector('.playerName')
const playerList = document.querySelector('.playerList')
const wrapper = document.querySelector('.container-sm')
const tableBody = document.querySelector('tbody')
const topPlayers = Array.from(document.querySelectorAll('.playerNameTop'))
const bottomPlayers = Array.from(document.querySelectorAll('.playerNameBottom'))

let currentRound = 1
const winnersStay = true
const roundTracker = document.querySelector('.roundTracker')

const currentPlayers = [
  new Player('Gergo', 1),
  new Player('Erika', 1),
  new Player('Jani', 1),
  new Player('Laci', 1),
  new Player('Judit', 2),
  new Player('Angela', 2),
]
let currentTeams = []

wrapper.addEventListener('click', e => {
  let event = e.target.classList[0]

  switch (event) {
    case 'addPlayrBtn':
      addPlayerToList(playerNameInput.value)
      break
    case 'randomizeGroupBtn':
      randomizeTeams()
      fillOutTable()
      break
    case 'deletePlayer':
      deletePlayer(e)
      break
    case 'closePlayrs':
      break
    case 'startGame':
      startGame()
      break
    case 'topHalf':
      teamScores(event)
      break
    case 'bottomHalf':
      teamScores(event)
      break
  }
})

const addPlayerToList = name => {
  let player = new Player(name)
  //push to currentList array
  currentPlayers.push(player)

  //add to html
  playerList.innerHTML += `
    <li class="list-group-item">
      <div class="d-flex justify-content-between align-items-center">
        <span>${name}</span>
        <button class="deletePlayer btn h-50 btn-danger">Delete</button>
      </div>
    </li>
    `
}

const deletePlayer = e => {
  //remove from HTML
  e.target.parentElement.parentElement.remove()

  //remove from array
  let playerName =
    e.target.parentElement.getElementsByTagName('span')[0].textContent
  let index = currentPlayers.indexOf(playerName)

  currentPlayers.splice(index, 1)
}

const randomizeTeams = () => {
  currentTeams = []
  let teamCounter = 1
  const numberOfTeams = currentPlayers.length % 2
  const shuffledArray = currentPlayers.sort((a, b) => 0.5 - Math.random())

  if (numberOfTeams === 0) {
    for (let i = 0; i < currentPlayers.length; i += 2) {
      currentTeams.push(
        new Team(shuffledArray[i], shuffledArray[i + 1], teamCounter)
      )

      if (i % 2 === 0) {
        teamCounter++
      }
    }
  } else {
    alert('Odd number of players')
  }
}

const fillOutTable = () => {
  tableBody.innerHTML = ''

  currentTeams.map(team => {
    tableBody.innerHTML += `
    <tr>
      <th scope="row">Team ${team.teamNumber} ${team.active ? ' *' : ''}</th>
      <td>${team.players[0].name} (${team.players[0].score})</td>
      <td>${team.players[1].name} (${team.players[1].score})</td>
    </tr>
    `
  })
}

const startGame = () => {
  let firstTeam = currentTeams[0]
  let secondTeam = currentTeams[1]

  firstTeam.side = 'top'
  secondTeam.side = 'bottom'

  for (let i = 0; i < 2; i++) {
    currentTeams[i].activateTeam()
  }

  populateField(firstTeam, secondTeam)
  fillOutTable()
}

const teamScores = team => {
  //increment round counter and display it
  currentRound++
  roundTracker.textContent = 'Round ' + currentRound

  let topTeam = currentTeams.find(team => team.side === 'top')
  let bottomTeam = currentTeams.find(team => team.side === 'bottom')

  topTeam.participate()
  bottomTeam.participate()

  team === 'topHalf' ? topTeam.score() : bottomTeam.score()

  refreshScores(topTeam, bottomTeam)
  evaluate(topTeam, bottomTeam)
  console.log(currentTeams)
}

const evaluate = (top, bottom) => {
  let duplicates = []
  let hierarchy = [
    top.players[0],
    top.players[1],
    bottom.players[0],
    bottom.players[1],
  ]

  hierarchy.sort((playerA, playerB) => playerA.score - playerB.score).reverse()
  hierarchy.map((player, i) => {
    if (i < 3 && player.score === hierarchy[i + 1].score)
      duplicates.push(player.score)
  })

  let secondStrongest = hierarchy[1]
  let weakest = hierarchy[hierarchy.length - 1]

  let winningTeam = currentTeams.find(team => team.justScored)
  let losingTeam = currentTeams.find(
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
      secondStrongest = determineWeakerPlayer(winningTeam)
      weakest = determineWeakerPlayer(losingTeam)

      swapTeam(secondStrongest, weakest)
      oneTeamLeavesTheField(top, bottom, !winnersStay)
    }
  } else {
    oneTeamLeavesTheField(top, bottom, winnersStay)
  }

  fillOutTable()

  //reset justScored
  top.resetJustScored()
  bottom.resetJustScored()
}

const swapTeam = (secondStrongest, weak) => {
  let strongsTeam = currentTeams.find(
    team => team.teamNumber === secondStrongest.team
  )
  let strongIndex = strongsTeam.players.indexOf(secondStrongest)

  let weaksTeam = currentTeams.find(team => team.teamNumber === weak.team)
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

const oneTeamLeavesTheField = (top, bottom, doesWinnerStay) => {
  let leavingTeam

  if (top.justScored) {
    leavingTeam = doesWinnerStay ? bottom : top
  } else {
    leavingTeam = doesWinnerStay ? top : bottom
  }

  teamMovesOffTheField(leavingTeam)
  nextTeam(leavingTeam)
  alert(
    'Leave: ' +
      leavingTeam.players[0].name +
      ' | ' +
      leavingTeam.players[1].name +
      '\n Next: ' +
      currentTeams[1].players[0].name +
      ' | ' +
      currentTeams[1].players[1].name +
      '. \n'
  )
  populateField(currentTeams[0], currentTeams[1])
}

const nextTeam = previousTeam => {
  let index = currentTeams.indexOf(previousTeam)

  if (index === 0) {
    currentTeams.push(currentTeams.shift())
  } else {
    let stayingTeam = currentTeams.shift()
    let leavingTeam = currentTeams.shift()

    currentTeams.push(leavingTeam)
    currentTeams.unshift(stayingTeam)
  }

  currentTeams[0].side === 'top'
    ? currentTeams[1].takeTopSide()
    : currentTeams[1].takeBottomSide()

  teamMovesOnTheField(currentTeams[1])
}

const teamMovesOffTheField = team => {
  team.side = ''
  team.deactivateTeam()
}

const teamMovesOnTheField = team => {
  currentTeams[0].side === 'top' ? (team.side = 'bottom') : (team.side = 'top')

  team.activateTeam()
}

const determineWeakerPlayer = team => {
  if (team.players[0].score > team.players[1].score) {
    return team.players[1]
  } else if (team.players[0].score < team.players[1].score) {
    return team.players[0]
  } else {
    return Math.random() <= 0.5 ? team.players[0] : team.players[1]
  }
}

const populateField = (...teams) => {
  let index = teams[0].side === 'top' ? 0 : 1

  topPlayers.map(
    (top, i) =>
      (top.textContent =
        teams[index].players[i].name +
        '(' +
        teams[index].players[i].score +
        ')')
  )

  //switch from 1 -> 0 or 0 -> 1 with bitwise
  index ^= 1

  bottomPlayers.map(
    (bottom, i) =>
      (bottom.textContent =
        teams[index].players[i].name +
        '(' +
        teams[index].players[i].score +
        ')')
  )
}

const refreshScores = (topTeam, bottomTeam) => {
  topPlayers.map((topPlayerNode, i) => {
    topPlayerNode.textContent =
      topTeam.players[i].name + '(' + topTeam.players[i].score + ')'
  })

  bottomPlayers.map((bottomPlayerNode, i) => {
    bottomPlayerNode.textContent =
      bottomTeam.players[i].name + '(' + bottomTeam.players[i].score + ')'
  })
}

const newGame = () => {
  currentRound = 1
}

const clearList = () => {}
