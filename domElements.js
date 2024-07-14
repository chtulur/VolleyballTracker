export const topPlayers = Array.from(
  document.querySelectorAll('.playerNameTop')
)
export const bottomPlayers = Array.from(
  document.querySelectorAll('.playerNameBottom')
)
export const fieldNodesArr = [...topPlayers, ...bottomPlayers]

export const wrapper = document.querySelector('.container-sm')
export const tableBody = document.querySelector('tbody')
export const playersHeader = document.querySelector('.playersHeader')
export const playerNameInput = document.querySelector('.playerName')
export const modalTitle = document.querySelector('.modal-title')
export const roundTracker = document.querySelector('.roundTracker')

//buttons
export const resetScoreBtn = document.querySelector('.resetScoreBtn')
export const startBtn = document.querySelector('.startGame')
export const addBtn = document.querySelector('.addPlayrBtn')
export const randomizeBtn = document.querySelector('.randomizeGroupBtn')
export const undoBtn = document.querySelector('.undoBtn')
export const redoBtn = document.querySelector('.redoBtn')
export const skipTopBtn = document.querySelector('.skipTop')
export const skipBottomBtn = document.querySelector('.skipBottom')

export const handleButtonDisables = () => {
  const deleteBtns = Array.from(document.querySelectorAll('.deletePlayer'))
  deleteBtns.forEach(btn => (btn.disabled = !btn.disabled))
  resetScoreBtn.disabled = !resetScoreBtn.disabled
  startBtn.disabled = !startBtn.disabled
  undoBtn.disabled = !undoBtn.disabled
  redoBtn.disabled = !redoBtn.disabled
  addBtn.disabled = !addBtn.disabled
  randomizeBtn.disabled = !randomizeBtn.disabled
  skipBottomBtn.disabled = !skipBottomBtn.disabled
  skipTopBtn.disabled = !skipTopBtn.disabled
}
