import React from "react";

import Login from "./Login";
import Home from "./Home";
import Game from "./Game";

import { store } from "./state";

import './App.css';

export default function App() {
  const { state, dispatch } = React.useContext(store);

  const renderPage = () => {
    if (!state.user) {
      return (
        <Login
          onUserLogin={user =>
            dispatch({
              type: "set_user",
              payload: { user }
            })
          }
        />
      );
    }

    if (!state.game) {
      return (
        <Home
          onGameJoined={game =>
            dispatch({
              type: "set_game",
              payload: { game }
            })
          }
        />
      );
    }

    return <Game />;
  }

  return (
    <div className="container">
      {renderPage()}
    </div>
  )
}
