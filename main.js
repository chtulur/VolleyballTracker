import Player from './Player.js'
import Team from './Team.js'

const playerNameInput = document.querySelector('.playerName')
const playerList = document.querySelector('.playerList')
const wrapper = document.querySelector('.container-sm')
const tableBody = document.querySelector('tbody')
const topPlayers = Array.from(document.querySelectorAll('.playerNameTop'))
const bottomPlayers = Array.from(document.querySelectorAll('.playerNameBottom'))

let currentRound = 1
const roundTracker = document.querySelector('.roundTracker')

const currentPlayers = [
  new Player('Gergo'),
  new Player('Erika'),
  new Player('Jani'),
  new Player('Laci'),
  new Player('Judit'),
  new Player('Angela'),
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

  team === 'topHalf' ? topTeam.score() : bottomTeam.score()

  refreshScores(topTeam, bottomTeam)
  fillOutTable()
  evaluate(topTeam, bottomTeam)
}

const evaluate = (top, bottom) => {
  let duplicates = []
  let hierarchy = [
    top.players[0],
    top.players[1],
    bottom.players[0],
    bottom.players[1],
  ]

  hierarchy.map((player, i) => {
    if (i < 3 && player.score === hierarchy[i + 1].score)
      duplicates.push(player.score)
  })
  console.log(duplicates)

  hierarchy.sort(player => player.score)
  console.log(hierarchy)

  let strongest = hierarchy[0]
  let secondStrongest = hierarchy[1]
  let weakest = hierarchy[hierarchy.length - 1]
  let secondWeakest = hierarchy[hierarchy.length - 2]

  // if all are equal
  if (duplicates.length === 3) {
    if (top.justScored) {
      teamMovesOffTheField(bottom)
      nextTeam(bottom)
      populateField(top, currentTeams[1])
    } else {
      teamMovesOffTheField(top)
      nextTeam(top)
      populateField(bottom, currentTeams[1])
    }

    //3 lowests are equal
    // } else if (counter === 3 && hierarchy[length - 1] > hierarchy[length - 2]) {
    //if 3 weaker scores are equal
    //if the strongest player's team scored
    //if the weaker team scored
    //3 highest are equal
    // } else if (counter === 3 && hierarchy[0] > hierarchy[1]) {
    //if 3 strong scores are equal
    //if the weaker team scored, they stay on the field
    //1 1 *
    //0 0
  } else if (
    duplicates.length === 2 &&
    strongest.justScored &&
    secondStrongest.score === strongest.score &&
    strongest.team === secondStrongest.team &&
    weakest.score === secondWeakest.score
  ) {
    //randomly select from top and bottom and just swap them. The scoring team has to leave.

    let selectedStrong = Math.random() <= 0.5 ? strongest : secondStrongest

    let selectedWeak = Math.random() <= 0.5 ? weakest : secondWeakest

    swapTeam(selectedStrong, selectedWeak)

    if (top.justScored) {
      teamMovesOffTheField(bottom)
      nextTeam(top)
      populateField(bottom, currentTeams[1])
    } else {
      teamMovesOffTheField(top)
      nextTeam(top)
      populateField(bottom, currentTeams[1])
    }

    //pick a strong player randomly
    //pick the weakest player
    //pick the weakest player randomly if scores are the same
  }

  fillOutTable()

  //reset justScored
  top.resetJustScored()
  bottom.resetJustScored()
}

const swapTeam = (strong, weak) => {
  let strongsTeam = currentTeams.find(team => team.teamNumber === strong.team)
  let strongIndex = strongsTeam.players.indexOf(strong)

  let weaksTeam = currentTeams.find(team => team.teamNumber === weak.team)
  let weakIndex = weaksTeam.players.indexOf(weak)

  strongsTeam.players[strongIndex] = weak
  weaksTeam.players[weakIndex] = strong
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
