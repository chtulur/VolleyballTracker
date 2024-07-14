import Player from './Player.js'
import Team from './Team.js'
import Parser from './Parser.js'
import Global from './Global.js'
import Render from './Render.js'
import UndoRedo from './UndoRedo.js'
import Evaluator from './Evaluator.js'
import LocalStorage from './LocalStorage.js'
import * as dom from './domElements.js'

/**
 * TODO:
 * - Use player participation to show statistics at the end of match
 * - End game score can be set and game ends when a player reaches it. Think about ties
 * - check if all the data is used for something in the existing objects.
 * - Remove the alerts and create something visually more pleasing.
 * - Add animations for teams leaving, switching and entering
 * - Think about which team has the serve and find a way so also show that
 *
 * BIG:
 * - Implement king of the hill game mode
 * - Maybe create another game mode
 *
 */

let gameMode = 'balanced'
let isGameOnGoing = false

let isPlayerListChanged = false
let teamsRandomized = false

addEventListener('load', _ => {
  if (LocalStorage.getPlayers() === null || LocalStorage.getPlayers() === '')
    return

  const parse = JSON.parse(LocalStorage.getPlayers())
  Parser.playerParser(parse)
  Render.renderPlayerList()

  if (LocalStorage.getTeams() === null || LocalStorage.getTeams() === '') return

  const teamParse = JSON.parse(LocalStorage.getTeams())
  Parser.teamParser(teamParse)
  Render.renderTeamTable()
})

dom.wrapper.addEventListener('click', e => {
  let event = e.target.classList[0]

  switch (event) {
    case 'addPlayrBtn':
      addPlayerToList(dom.playerNameInput.value)
      break
    case 'randomizeGroupBtn':
      randomizeTeams()
      Render.renderTeamTable()
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
      UndoRedo.undo()
      break
    case 'redoBtn':
      UndoRedo.redo()
      break
    case 'form-select':
      changeMode(e.target)
      break
    case 'resetScoreBtn':
      resetScores()
    case 'skipBottom':
      Render.renderModalHeader(e.target.classList[1])
      break
    case 'skipTop':
      Render.renderModalHeader(e.target.classList[1])
      break
    case 'skipBtn':
      skip()
      break
  }
})

const addPlayerToList = name => {
  if (name === '') return
  if (Global.getCurrentPlayers().find(player => player.name === name))
    return alert('player already exists')

  UndoRedo.resetUndoRedoRounds()
  isPlayerListChanged = true

  let player = Player.createPlayer({name})
  Global.addPlayer(player)
  LocalStorage.setPlayers()
  Render.renderPlayerListElement(name)
}

const deletePlayer = e => {
  UndoRedo.resetUndoRedoRounds()
  isPlayerListChanged = true

  //remove from HTML
  let element = e.target

  while (!(element instanceof HTMLLIElement)) {
    element = element.parentElement
  }

  let playerName = element.getElementsByTagName('span')[0].textContent
  let index = Global.getCurrentPlayers().findIndex(
    player => player.name === playerName
  )

  Global.getCurrentPlayers().splice(index, 1)
  element.remove()

  LocalStorage.setPlayers()

  //reset ID to 0 when the last player have been deleted
  if (Global.getCurrentPlayers().length === 0) {
    LocalStorage.setID(0)
  }

  //reset teams
  //This doesn't reset if you remove a name that's not yet part of a team
  //I want to be able to add new teams to an already ongoing game.
  if (!Global.getCurrentTeams().some(team => team.findPlayer(playerName)))
    return
  Global.setCurrentTeams([])
  Render.renderTeamTable()
  LocalStorage.setTeams()
}

const randomizeTeams = () => {
  Global.setCurrentTeams([])
  let teamCounter = 1
  const arePlayersEven = Global.getCurrentPlayers().length % 2 === 0
  const shuffledPlayersArray = Global.getCurrentPlayers().sort(
    () => 0.5 - Math.random()
  )

  if (arePlayersEven) {
    teamsRandomized = true
    UndoRedo.resetUndoRedoRounds()

    for (let i = 0; i < Global.getCurrentPlayers().length; i += 2) {
      shuffledPlayersArray[i].team = teamCounter
      shuffledPlayersArray[i + 1].team = teamCounter

      Global.addTeam(
        Team.createTeam({
          playerI: shuffledPlayersArray[i],
          playerII: shuffledPlayersArray[i + 1],
          teamNumber: teamCounter,
        })
      )

      if (i % 2 === 0) {
        teamCounter++
      }
    }

    LocalStorage.setTeams()
  } else {
    alert('Odd number of players')
  }
}

const teamScores = team => {
  if (!isGameOnGoing) return
  //Order is important here for round tracking
  UndoRedo.handleUndoUpdate()

  Global.incrementCurrentRonud()
  Render.renderRoundDisplay()

  let topTeam = Global.getCurrentTeams().find(team => team.side === 'top')
  let bottomTeam = Global.getCurrentTeams().find(team => team.side === 'bottom')

  //actualScoring
  team === 'topHalf' ? topTeam.score() : bottomTeam.score()

  //keeping track of player participation for statistics later
  topTeam.participate()
  bottomTeam.participate()

  delegateGameModeEvaluation(topTeam, bottomTeam)
  LocalStorage.setTeams()
}

const delegateGameModeEvaluation = (topTeam, bottomTeam) => {
  switch (gameMode) {
    case 'balanced':
      Evaluator.evaluate(topTeam, bottomTeam)
      break
    case 'kingOfTheHill':
      evaluateKingOfTheHill()
      break
  }
}

//TODO: implement this
const evaluateKingOfTheHill = () => {}

const startGame = () => {
  if (
    (isPlayerListChanged && !teamsRandomized) ||
    dom.tableBody.innerHTML === ''
  )
    return alert('Randomize teams first')
  if (Global.getCurrentTeams().length === 1)
    return alert('There must be at least 2 teams to start a game')

  dom.handleButtonDisables()
  isGameOnGoing = true
  isPlayerListChanged = false
  teamsRandomized = false

  let firstTeam = Global.getCurrentTeams()[0]
  let secondTeam = Global.getCurrentTeams()[1]

  firstTeam.side = 'top'
  secondTeam.side = 'bottom'

  firstTeam.activateTeam()
  secondTeam.activateTeam()

  Render.renderField(firstTeam, secondTeam)
  Render.renderTeamTable()
}

const stopGame = () => {
  if (!isGameOnGoing) return

  dom.handleButtonDisables()
  isGameOnGoing = false
  dom.fieldNodesArr.map(node => (node.textContent = ''))
}

const changeMode = e => {
  gameMode = e.value
}

const resetScores = () => {
  Global.getCurrentPlayers().forEach(player => {
    player.score = 0
    player.roundsParticipatedIn = 0
  })

  Render.renderTeamTable()
  Global.setCurrentRound(1)
  Render.renderRoundDisplay()

  UndoRedo.resetUndoRedoActions()
  LocalStorage.setTeams()
  LocalStorage.setPlayers()
}

const skip = () => {
  let leavingTeam = Global.getCurrentTeams().find(
    team => team.side === Global.getSkippingTeam()
  )

  //TODO: Clean this shit up and move them to a separate function
  UndoRedo.handleUndoUpdate() //this has to be first
  leavingTeam.teamMovesOffTheField()
  Evaluator.nextTeam(leavingTeam)
  Render.renderTeamTable()
  Render.renderField(Global.getCurrentTeams()[0], Global.getCurrentTeams()[1])

  LocalStorage.setTeams() //best to leave local storage last
}
