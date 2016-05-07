const teams = (teams = [], action) => {
  if (action.type == 'UPDATE_TEAMS') {
    return action.teams;
  }
  return teams;
};

export default teams;
