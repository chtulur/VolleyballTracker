import * as dom from './domElements.js'
import Global from './Global.js'

const Render = (() => {
  const renderPlayerListElement = name => {
    dom.playersHeader.insertAdjacentHTML(
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

  const renderPlayerList = () => {
    Global.getCurrentPlayers().forEach(player =>
      renderPlayerListElement(player.name)
    )
  }

  const renderTeamTable = () => {
    dom.tableBody.innerHTML = ''

    Global.getCurrentTeams().forEach(team => {
      dom.tableBody.innerHTML += `
        <tr>
          <th scope="row">Team ${team.teamNumber} ${
        team.active ? ' *' : ''
      }</th>
          <td>${team.players[0].name} (${team.players[0].score})</td>
          <td>${team.players[1].name} (${team.players[1].score})</td>
        </tr>
      `
    })
  }

  const renderField = (...teams) => {
    let index = teams[0].side === 'top' ? 0 : 1

    dom.topPlayers.forEach(
      (top, i) =>
        (top.textContent = `${teams[index].players[i].name} (${teams[index].players[i].score})`)
    )

    index ^= 1 // Toggle index for the bottom team

    dom.bottomPlayers.forEach(
      (bottom, i) =>
        (bottom.textContent = `${teams[index].players[i].name} (${teams[index].players[i].score})`)
    )
  }

  const renderModalHeader = side => {
    Global.setSkippingTeam(side)
    dom.modalTitle.textContent = `Skip ${side} team's turn`
  }

  const renderRoundDisplay = () => {
    dom.roundTracker.textContent = `Round ${Global.getCurrentRound()}`
  }

  // Public API
  return {
    renderPlayerList,
    renderPlayerListElement,
    renderTeamTable,
    renderField,
    renderModalHeader,
    renderRoundDisplay,
  }
})()

export default Render
