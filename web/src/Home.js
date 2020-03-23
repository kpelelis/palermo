import React from "react";
import { store } from "./state";

import { createGame, joinGame } from "./api";

import "./Home.css";

export default function Home(props) {
  const {
    state: { user }
  } = React.useContext(store);
  const [gameId, setGameId] = React.useState("");
  const { onGameJoined } = props;

  return (
    <div className="home">
      <div
        className="button"
        onClick={() =>
          createGame(user.id)
            .then(game => joinGame(user.id, game.id))
            .then(game => onGameJoined(game))
        }
      >
        Φτίαξε νέο παιχνίδι
      </div>
      <p>ή</p>
      <div
        className="button"
        onClick={() =>
          joinGame(user.id, parseInt(gameId, 10))
            .then(game => onGameJoined(game))
        }
      >
        Μπες σε ένα παιχνίδι
      </div>
      <input
        placeholder="ID παιχνιδιου (π.χ. 5)"
        type="text"
        value={gameId}
        onChange={e => setGameId(e.target.value)}
      />
    </div>
  );
}
