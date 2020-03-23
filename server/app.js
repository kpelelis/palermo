const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const sqlite = require('sqlite');

const dbPromise = sqlite.open("/var/sites/palermo/db.sqlite", { Promise });

const app = module.exports = new Koa();
const router = new Router();

const GameState = {
  CREATED: 0,
  STARTED: 1,
};

const MIN_ENTRIES = 6;

const cards = [
  {
    name: 'Φανερός Δονολοφόνος',
    description: 'Εξοντώστε όλους τους αθώους',
    quantity: (gameSize) => {
      if (gameSize <= 10) {
        return 1;
      }
      return 2;
    }
  },
  {
    name: 'Κρυφός Δονολοφόνος',
    description: 'Εξοντώστε όλους τους αθώους',
    quantity: (gameSize) => {
      if (gameSize < 9) {
        return 0;
      }
      return 1;
    }
  },
  {
    name: 'Ρουφιάνος',
    description: 'Βοηθήστε τους δολοφόνους να κερδίσουν',
    quantity: 1
  },
  {
    name: 'Αστυνόμος',
    description: 'Βοηθήστε τους αθώους να κερδίσουν',
    quantity: 1
  },
  {
    name: 'Πολίτης',
    description: 'Εξοντώστε όλους τους δολοφόνους',
    quantity: (gameSize) => {
      if (gameSize < 10) {
        return gameSize - 3;
      }
      if (gameSize === 10) {
        return gameSize - 4;
      }
      return gameSize - 5;
    }
  },
];

router.post('/login', async (ctx, next) => {
  const username = ctx.request.body.username;
  const db = await dbPromise;
  const user = await db.get(
    "SELECT * FROM user WHERE username = (?)",
    username,
  );

  if (user) {
    ctx.body = {
      id: user.id,
      username,
    };
    ctx.status = 200;
    return;
  }

  const stmt = await db.run(
    "INSERT INTO user (username) VALUES (?)",
    username,
  );

  if (!stmt.lastID) {
    ctx.status = 500;
    return;
  }
  ctx.body = {
    id: stmt.lastID,
    username,
  };
  ctx.status = 201;
});

router.post('/game', async (ctx, next) => {
  const db = await dbPromise;
  const stmt = await db.run(
    "INSERT INTO game (date_created, state) VALUES (?, ?)",
    new Date(),
    GameState.CREATED,
  );

  if (!stmt.lastID) {
    ctx.status = 404;
    return;
  }
  ctx.body = {
    id: stmt.lastID,
    state: GameState.STARTED,
  };
});

router.post('/join/:id', async (ctx, next) => {
  const db = await dbPromise;
  const game = await db.get("SELECT * FROM game WHERE id = (?)", ctx.params.id);
  if (!game) {
    ctx.status = 404;
    ctx.body = 'Game not found';
    return;
  }

  const entry = await db.get(
    "SELECT * FROM game_entry WHERE user_id = (?) AND game_id = (?)",
    ctx.request.body.userId,
    ctx.params.id,
  );

  if (entry) {
    ctx.status = 200;
    ctx.body = game;
    return;
  }

  if (game.state !== GameState.CREATED) {
    ctx.status = 400;
    ctx.body = 'Game already started';
    return;
  }


  await db.run(
    "INSERT INTO game_entry (user_id, game_id) VALUES (?, ?)",
    ctx.request.body.userId,
    ctx.params.id,
  );

  ctx.status = 200;
  ctx.body = game;
});

router.post('/start/:id', async (ctx, next) => {
  const db = await dbPromise;
  const game = await db.get("SELECT * FROM game WHERE id = (?)", ctx.params.id);

  if (!game) {
    ctx.status = 404;
    ctx.body = 'Game not found';
    return;
  }

  if (game.state === GameState.STARTED) {
    ctx.status = 400;
    ctx.body = 'Game already started';
  }

  const entries = await db.all(
    "SELECT * FROM game_entry WHERE game_id = (?)",
    ctx.params.id
  );

  if (entries.length < MIN_ENTRIES) {
    ctx.status = 400;
    ctx.body = 'Not enough players';
    return;
  };

  entries.sort(() => Math.random() - 0.5);
  const dbBatch = [];

  let entryIndex = 0;
  const cardsToDeal = cards.map((card, id) => {
    const quantity = typeof card.quantity === 'function'
      ? card.quantity(entries.length)
      : card.quantity;
    for (let i = 0; i < quantity; i++) {
      dbBatch.push(db.run(
        "INSERT INTO game_card (user_id, game_id, card_id) VALUES (?, ?, ?)",
        entries[entryIndex].user_id,
        entries[entryIndex].game_id,
        id,
      ));
      entryIndex++;
    }
  });
  await Promise.all(dbBatch);

  await db.run(
    "UPDATE game SET state = (?) WHERE id = (?)",
    GameState.STARTED,
    ctx.params.id,
  );

  ctx.status = 200;
  ctx.body = {
    id: game.id,
    state: GameState.STARTED,
  }
});

router.get('/game/:id', async (ctx, next) => {
  const db = await dbPromise;
  const game = await db.get("SELECT * FROM game WHERE id = (?)", ctx.params.id);
  if (!game) {
    ctx.status = 404;
    ctx.body = 'Game not found';
    return;
  }

  ctx.status = 200;
  ctx.body = game;
});

router.get('/game/:id/card', async (ctx, next) => {
  console.log("KOKOLALA");
  const db = await dbPromise;
  const game = await db.get("SELECT * FROM game WHERE id = (?)", ctx.params.id);

  if (!game) {
    ctx.status = 404;
    ctx.body = 'Game not found';
    return;
  }

  if (game.state != GameState.STARTED) {
    ctx.status = 400;
    ctx.body = 'Game not started yet';
    return;
  }

  const gameCard = await db.get(
    "SELECT * FROM game_card WHERE user_id = (?) AND game_id = (?)",
    ctx.request.query.userId,
    ctx.params.id,
  );

  if (!gameCard) {
    ctx.status = 500;
    return;
  }

  let card = cards[gameCard.card_id];
  ctx.status = 200;
  ctx.body = card;
});

app
  .use(bodyParser())
  .use(router.routes());

app.listen(4000);
