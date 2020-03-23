import React from "react";
import { store } from "./state";

import { startGame, getCard } from "./api";

import "./Game.css";

const GameState = {
  CREATED: 0,
  STARTED: 1,
}

export default function Home(props) {
  const {
    state: { game, user },
    dispatch
  } = React.useContext(store);

  React.useEffect(() => {
    if (!game.card && game.state === GameState.STARTED) {
      getCard(user.id, game.id).then(card =>
        dispatch({
          type: "set_game_card",
          payload: { card: card }
        })
      );
    }
  }, []);

  return (
    <div>
      {game.state === GameState.CREATED && (
        <>
          <h3>Το ID του παιχνιδιού είναι: {game.id}</h3>
          <div
            className="button"
            onClick={() =>
                startGame(game.id)
                  .then(() => {
                    dispatch({ type: "start_game" });
                    return getCard(user.id, game.id);
                  })
                  .then(card =>
                    dispatch({
                      type: "set_game_card",
                      payload: { card: card }
                    })
                  )
            }
          >
            Ξεκίνα το παιχνίδι
          </div>
        </>
      )}
      {
        game.card && (
          <div className="card">
            <h3>Η Κάρτα σου είναι</h3>
            <h3>{game.card.name}</h3>
            <div>{game.card.description}</div>
          </div>
        )
      }
    </div>
  );
}
