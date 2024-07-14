const Global = (() => {
  let currentPlayers = []
  let currentTeams = []
  let skippingTeam = ''
  let currentRound = 1

  const getCurrentRound = () => currentRound
  const setCurrentRound = round => (currentRound = round)
  const incrementCurrentRonud = () => currentRound++

  const getCurrentPlayers = () => currentPlayers
  const addPlayer = player => currentPlayers.push(player)
  const setCurrentPlayers = players => {
    currentPlayers = players
  }

  const getCurrentTeams = () => currentTeams
  const addTeam = team => currentTeams.push(team)
  const setCurrentTeams = teams => {
    currentTeams = teams
  }

  const getSkippingTeam = () => skippingTeam
  const setSkippingTeam = team => (skippingTeam = team)

  return {
    addPlayer,
    getCurrentPlayers,
    setCurrentPlayers,
    addTeam,
    getCurrentTeams,
    setCurrentTeams,
    getSkippingTeam,
    setSkippingTeam,
    getCurrentRound,
    setCurrentRound,
    incrementCurrentRonud,
  }
})()
//IIFE runs and returns an object that provides the interface for functions
//The variables are persistent in memory through closures.
//this can mimic OOP with proper functional methods

export default Global
