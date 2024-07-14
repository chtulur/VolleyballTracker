import LocalStorage from './LocalStorage.js'

const Player = (() => {
  const createPlayer = ({
    name,
    team = 0,
    score = 0,
    justScored = false,
    roundsParticipatedIn = 0,
    id,
  }) => {
    //init ID
    if (id === undefined) {
      let localID = JSON.parse(LocalStorage.getID())
      id = ++localID
      LocalStorage.setID(localID)
    }

    return {
      id,
      name,
      team,
      score,
      justScored,
      roundsParticipatedIn,
    }
  }

  return {
    createPlayer,
  }
})()

export default Player
