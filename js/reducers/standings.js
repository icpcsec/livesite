const standings = (standings = [], action) => {
  if (action.type === 'UPDATE_STANDINGS') {
    return action.standings;
  }
  return standings;
};

export default standings;
