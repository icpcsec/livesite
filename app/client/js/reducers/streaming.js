const streaming = (streaming = {}, action) => {
  if (action.type == 'SHOW_STREAMING') {
    streaming = { x: action.x, y: action.y };
  } else if (action.type == 'HIDE_STREAMING') {
    streaming = {};
  }
  return streaming;
};

export default streaming;
