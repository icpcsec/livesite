const standings = (standings = {problems: [], entries: []}, action) => {
  if (action.type === 'UPDATE_STANDINGS') {
    return action.standings;
  }
  return standings;
};

export default standings;
