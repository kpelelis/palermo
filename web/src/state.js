// store.js
import React, { createContext, useReducer } from "react";

const initialState = () => {
  const user = localStorage.getItem('user');
  if (user) {
    return {
      user: JSON.parse(user),
      game: null,
    };
  }
  return {
    user: null,
    game: null,
  };
}
const store = createContext(initialState);
const { Provider } = store;

function reducer(state, action) {
  switch (action.type) {
    case "set_user":
      return {
        ...initialState,
        user: action.payload.user
      };
    case "set_game":
      return {
        ...state,
        game: action.payload.game
      };
    case "start_game":
      return {
        ...state,
        game: {
          ...state.game,
          state: "started"
        }
      };
    case "set_game_card":
      return {
        ...state,
        game: {
          ...state.game,
          card: action.payload.card
        }
      };
    default:
      return state;
  }
}

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState());

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
