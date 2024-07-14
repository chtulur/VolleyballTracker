import Parser from './Parser.js'
import Global from './Global.js'
import Render from './Render.js'

const UndoRedo = (() => {
  let wasUndoUsed = false
  let savedUndoActions = '[]' // Initialized as an empty array (length 2 when empty)
  let savedRedoActions = '[]' // Initialized as an empty array (length 2 when empty)

  const undo = () => {
    if (savedUndoActions.length === 2) return
    wasUndoUsed = true
    const parse = JSON.parse(savedUndoActions)

    const lastAction = parse.pop()
    savedUndoActions = JSON.stringify(parse)
    saveUndoRedo('redo')
    handleUndoRedoChanges(lastAction)
  }

  const redo = () => {
    if (savedRedoActions.length === 2) return
    const parse = JSON.parse(savedRedoActions)

    const forwardAction = parse.pop()
    savedRedoActions = JSON.stringify(parse)

    saveUndoRedo('undo')
    handleUndoRedoChanges(forwardAction)
  }

  const handleUndoRedoChanges = action => {
    Parser.playerParser(action.currentPlayers)
    Parser.teamParser(action.currentTeams)
    Global.setCurrentRound(action.currentRound)

    Render.renderTeamTable()
    Render.renderField(Global.getCurrentTeams()[0], Global.getCurrentTeams()[1])
    Render.renderRoundDisplay()
  }

  const saveUndoRedo = undo_redo => {
    const obj = {
      currentRound: Global.getCurrentRound(),
      currentPlayers: Global.getCurrentPlayers(),
      currentTeams: Global.getCurrentTeams(),
    }

    if (undo_redo === 'undo') {
      savedUndoActions = JSON.stringify(
        (parsed => {
          parsed.push(obj)
          return parsed
        })(JSON.parse(savedUndoActions))
      )
    } else {
      savedRedoActions = JSON.stringify(
        (parsed => {
          parsed.push(obj)
          return parsed
        })(JSON.parse(savedRedoActions))
      )
    }
  }

  const resetUndoRedoRounds = () => {
    resetUndoRedoActions()
    Global.setCurrentRound(1)
    Render.renderRoundDisplay()
  }

  const resetUndoRedoActions = () => {
    savedRedoActions = '[]'
    savedUndoActions = '[]'
  }

  const handleUndoUpdate = () => {
    if (wasUndoUsed) {
      savedRedoActions = JSON.stringify([])
      saveUndoRedo('undo')
      wasUndoUsed = false
    } else {
      saveUndoRedo('undo')
    }
  }

  return {
    undo,
    redo,
    handleUndoRedoChanges,
    saveUndoRedo,
    resetUndoRedoRounds,
    resetUndoRedoActions,
    handleUndoUpdate,
  }
})()

export default UndoRedo
