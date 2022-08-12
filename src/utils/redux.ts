/*
 * Will dynamically create reducers
 * enforcing a unique way to describe reducers
 */
const createReducer = (initialState: Object, handlers: any) => {
  return (state = initialState, action: any) => {
    if (handlers.hasOwnProperty(action.type))
      return handlers[action.type](state, action);
    return state;
  };
};

export { createReducer };
