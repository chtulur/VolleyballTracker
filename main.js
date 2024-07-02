import Player from './Player.js'
import Team from './Team.js'

addEventListener('load', _ => {
  if (
    localStorage.getItem('currentPlayers') === null ||
    localStorage.getItem('currentPlayers') === ''
  )
    return

  const parse = JSON.parse(localStorage.getItem('currentPlayers'))

  currentPlayers = []
  parse.map(player =>
    currentPlayers.push(
      new Player(
        player.name,
        player.team,
        player.score,
        player.justScored,
        player.roundsParticipatedIn,
        player.id
      )
    )
  )
  fillOutPlayers()

  if (
    localStorage.getItem('currentTeams') === null ||
    localStorage.getItem('currentTeams') === ''
  )
    return

  currentTeams = []
  const teamParse = JSON.parse(localStorage.getItem('currentTeams'))

  teamParse.map(team =>
    currentTeams.push(
      new Team(
        currentPlayers.find(player => player.id === team.players[0].id),
        currentPlayers.find(player => player.id === team.players[1].id),
        team.teamNumber,
        team.side,
        team.active,
        team.justScored,
        team.teamScores
      )
    )
  )

  fillOutTable()
})

const resetScoreBtn = document.querySelector('.resetScoreBtn')
const playersHeader = document.querySelector('.playersHeader')
const startBtn = document.querySelector('.startGame')
const addBtn = document.querySelector('.addPlayrBtn')
const randomizeBtn = document.querySelector('.randomizeGroupBtn')
const playerNameInput = document.querySelector('.playerName')
const wrapper = document.querySelector('.container-sm')
const tableBody = document.querySelector('tbody')
const topPlayers = Array.from(document.querySelectorAll('.playerNameTop'))
const bottomPlayers = Array.from(document.querySelectorAll('.playerNameBottom'))
const undoBtn = document.querySelector('.undoBtn')
const redoBtn = document.querySelector('.redoBtn')

let gameMode = 'balanced'
let isGameOnGoing = false
let currentRound = 1
const winnersStay = true
const roundTracker = document.querySelector('.roundTracker')

let isPlayerListChanged = false
let teamsRandomized = false

//Undo stuff
let isUndoUsed = false
let savedUndoActions = JSON.stringify([]) //has to be inited as an array, to have the length 2
let savedRedoActions = JSON.stringify([]) // which means it's empty

let currentPlayers = []
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
    case 'startGame':
      startGame()
      break
    case 'topHalf':
      teamScores(event)
      break
    case 'bottomHalf':
      teamScores(event)
      break
    case 'stopGame':
      stopGame()
      break
    case 'undoBtn':
      undo()
      break
    case 'redoBtn':
      redo()
      break
    case 'form-select':
      changeMode(e.target)
      break
    case 'resetScoreBtn':
      resetScores()
  }
})

const fillOutPlayers = () => {
  currentPlayers.forEach(player => renderPlayerList(player.name))
}

const addPlayerToList = name => {
  if (name === '') return
  if (currentPlayers.find(player => player.name === name) instanceof Player)
    return alert('player already exists')

  resetUndoRedoRounds()
  isPlayerListChanged = true

  let player = new Player(name)
  currentPlayers.push(player)
  localStorage.setItem('currentPlayers', JSON.stringify(currentPlayers))
  renderPlayerList(name)
}

const renderPlayerList = name => {
  playersHeader.insertAdjacentHTML(
    'afterend',
    `<li class="list-group-item">
    <div class="d-flex justify-content-between align-items-center">
      <span class="deletePlayer">${name}</span>
      <button class="deletePlayer btn h-50 btn-outline-danger">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="deletePlayer bi bi-trash3-fill" viewBox="0 0 16 16">
          <path class="deletePlayer" d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
        </svg>
      </button>
    </div>
  </li>`
  )
}

const deletePlayer = e => {
  resetUndoRedoRounds()
  isPlayerListChanged = true
  //remove from HTML

  let element = e.target

  while (!(element instanceof HTMLLIElement)) {
    element = element.parentElement
  }

  let playerName = element.getElementsByTagName('span')[0].textContent
  let index = currentPlayers.findIndex(player => player.name === playerName)

  currentPlayers.splice(index, 1)
  element.remove()

  localStorage.setItem('currentPlayers', JSON.stringify(currentPlayers))

  //reset teams
  //Don't reset if you remove a name that's not yet part of a team
  //I want to be able to add new teams to an already ongoing game.
  if (!currentTeams.some(team => team.findPlayer(playerName))) return
  currentTeams = []
  fillOutTable()
  localStorage.setItem('currentTeams', JSON.stringify(currentTeams))
}

const randomizeTeams = () => {
  currentTeams = []
  let teamCounter = 1
  const numberOfTeams = currentPlayers.length % 2
  const shuffledArray = currentPlayers.sort((a, b) => 0.5 - Math.random())

  if (numberOfTeams === 0) {
    teamsRandomized = true
    resetUndoRedoRounds()

    for (let i = 0; i < currentPlayers.length; i += 2) {
      shuffledArray[i].team = teamCounter
      shuffledArray[i + 1].team = teamCounter

      currentTeams.push(
        new Team(shuffledArray[i], shuffledArray[i + 1], teamCounter)
      )

      if (i % 2 === 0) {
        teamCounter++
      }
    }

    localStorage.setItem('currentTeams', JSON.stringify(currentTeams))
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

const teamScores = team => {
  if (!isGameOnGoing) return

  if (isUndoUsed) {
    savedRedoActions = JSON.stringify([])
    saveUndoRedo('undo')
    isUndoUsed = false
  } else {
    saveUndoRedo('undo')
  }

  currentRound++
  ronudDisplayRender()

  let topTeam = currentTeams.find(team => team.side === 'top')
  let bottomTeam = currentTeams.find(team => team.side === 'bottom')

  topTeam.participate()
  bottomTeam.participate()

  team === 'topHalf' ? topTeam.score() : bottomTeam.score()

  refreshScores(topTeam, bottomTeam)

  switch (gameMode) {
    case 'balanced':
      evaluate(topTeam, bottomTeam)
      break
    case 'kingOfTheHill':
      evaluateKingOfTheHill()
      break
  }

  localStorage.setItem('currentTeams', JSON.stringify(currentTeams))
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

  localStorage.setItem('currentTeams', JSON.stringify(currentTeams))
  localStorage.setItem('currentPlayers', JSON.stringify(currentPlayers))
}

const evaluateKingOfTheHill = () => {}

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

const startGame = () => {
  if ((isPlayerListChanged && !teamsRandomized) || tableBody.innerHTML === '')
    return alert('Randomize teams first')
  if (currentTeams.length === 1)
    return alert('There must be at least 2 teams to start a game')

  const deleteBtns = Array.from(document.querySelectorAll('.deletePlayer'))
  deleteBtns.forEach(btn => (btn.disabled = true))
  startBtn.disabled = true
  undoBtn.disabled = false
  redoBtn.disabled = false
  addBtn.disabled = true
  resetScoreBtn.disabled = true
  isGameOnGoing = true
  randomizeBtn.disabled = true
  isPlayerListChanged = false
  teamsRandomized = false

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

const stopGame = () => {
  if (!isGameOnGoing) return

  const deleteBtns = Array.from(document.querySelectorAll('.deletePlayer'))

  resetScoreBtn.disabled = false
  startBtn.disabled = false
  undoBtn.disabled = true
  redoBtn.disabled = true
  deleteBtns.forEach(btn => (btn.disabled = false))
  addBtn.disabled = false
  randomizeBtn.disabled = false
  isGameOnGoing = false

  topPlayers.map(top => (top.textContent = ''))
  bottomPlayers.map(bottom => (bottom.textContent = ''))
}

const undo = () => {
  if (savedUndoActions.length === 2) return
  isUndoUsed = true
  const parse = JSON.parse(savedUndoActions)

  const lastAction = parse.pop()
  savedUndoActions = JSON.stringify(parse)
  saveUndoRedo('redo')

  currentPlayers = []
  currentTeams = []
  lastAction.currentPlayers.map(player =>
    currentPlayers.push(
      new Player(
        player.name,
        player.team,
        player.score,
        player.justScored,
        player.roundsParticipatedIn,
        player.id
      )
    )
  )
  lastAction.currentTeams.map(team =>
    currentTeams.push(
      new Team(
        currentPlayers.find(player => player.id === team.players[0].id),
        currentPlayers.find(player => player.id === team.players[1].id),
        team.teamNumber,
        team.side,
        team.active,
        team.justScored,
        team.teamScores
      )
    )
  )
  currentRound = lastAction.currentRound

  fillOutTable()
  populateField(currentTeams[0], currentTeams[1])
  ronudDisplayRender()
}

const redo = () => {
  //yes length 2 is goofy as fuck. When these are emptied later, it has length of 2, which is "empty". I could reset the variable somehow but I like length === 2, so... deal with it
  if (savedRedoActions.length === 2) return
  const parse = JSON.parse(savedRedoActions)

  const forwardAction = parse.pop()
  savedRedoActions = JSON.stringify(parse)
  saveUndoRedo('undo')

  currentPlayers = []
  currentTeams = []
  forwardAction.currentPlayers.map(player =>
    currentPlayers.push(
      new Player(
        player.name,
        player.team,
        player.score,
        player.justScored,
        player.roundsParticipatedIn,
        player.id
      )
    )
  )
  forwardAction.currentTeams.map(team =>
    currentTeams.push(
      new Team(
        currentPlayers.find(player => player.id === team.players[0].id),
        currentPlayers.find(player => player.id === team.players[1].id),
        team.teamNumber,
        team.side,
        team.active,
        team.justScored,
        team.teamScores
      )
    )
  )
  currentRound = forwardAction.currentRound

  fillOutTable()
  populateField(currentTeams[0], currentTeams[1])
  ronudDisplayRender()
}

const saveUndoRedo = undo_redo => {
  if (undo_redo === 'undo' && savedUndoActions.length === 0)
    savedUndoActions = JSON.stringify([
      {
        currentRound: currentRound,
        currentPlayers: currentPlayers,
        currentTeams: currentTeams,
      },
    ])
  else if (undo_redo === 'undo' && savedUndoActions.length > 0) {
    let parsed = JSON.parse(savedUndoActions)
    parsed.push({
      currentRound: currentRound,
      currentPlayers: currentPlayers,
      currentTeams: currentTeams,
    })
    savedUndoActions = JSON.stringify(parsed)
  } else if (undo_redo === 'redo' && savedRedoActions.length === 0)
    savedRedoActions = JSON.stringify([
      {
        currentRound: currentRound,
        currentPlayers: currentPlayers,
        currentTeams: currentTeams,
      },
    ])
  else if (undo_redo === 'redo' && savedRedoActions.length > 0) {
    let parsed = JSON.parse(savedRedoActions)
    parsed.push({
      currentRound: currentRound,
      currentPlayers: currentPlayers,
      currentTeams: currentTeams,
    })
    savedRedoActions = JSON.stringify(parsed)
  }
}

const resetUndoRedoRounds = () => {
  savedRedoActions = []
  savedUndoActions = []
  currentRound = 1
  ronudDisplayRender()
}

const ronudDisplayRender = () => {
  roundTracker.textContent = 'Round ' + currentRound
}

const changeMode = e => {
  gameMode = e.value
}

const resetScores = () => {
  currentPlayers.forEach(player => (player.score = 0))
  fillOutTable()
  currentRound = 1
  ronudDisplayRender()

  savedRedoActions = JSON.stringify([])
  savedUndoActions = JSON.stringify([])

  localStorage.setItem('currentPlayers', JSON.stringify(currentPlayers))
}
