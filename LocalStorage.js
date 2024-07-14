import Global from './Global.js'

const LocalStorage = (() => {
  const getTeams = () => localStorage.getItem('currentTeams')
  const setTeams = () =>
    localStorage.setItem(
      'currentTeams',
      JSON.stringify(Global.getCurrentTeams())
    )

  const getPlayers = () => localStorage.getItem('currentPlayers')
  const setPlayers = () =>
    localStorage.setItem(
      'currentPlayers',
      JSON.stringify(Global.getCurrentPlayers())
    )

  const getID = () => localStorage.getItem('id')
  const setID = id => localStorage.setItem('id', JSON.stringify(id))

  //init ID
  if (getID() === null) setID(0)

  return {
    setTeams,
    setPlayers,
    getPlayers,
    getTeams,
    getID,
    setID,
  }
})()

export default LocalStorage
