const ratings = (ratings = [], action) => {
  if (action.type == 'UPDATE_RATINGS') {
    return action.ratings;
  }
  return ratings;
};

export default ratings;
