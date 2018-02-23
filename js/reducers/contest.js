const contest = (contest = { problems: [] }, action) => {
  if (action.type === 'UPDATE_CONTEST') {
    return action.contest;
  }
  return contest;
};

export default contest;
