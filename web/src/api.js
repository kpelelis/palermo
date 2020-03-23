const SERVER_URL = '/api/';

export const login = async username => {
  const response = await fetch(`${SERVER_URL}/login`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({ username }),
  });
  const user = await response.json();
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const createGame = async () => {
  const response = await fetch(`${SERVER_URL}/game`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
  });
  const game = await response.json();
  return game;
};

export const joinGame = async (userId, gameId) => {
  try {
    const response = await fetch(`${SERVER_URL}/join/${gameId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    const game = await response.json();
    return game;
  } catch (error) {
    alert(error.message);
  }
};

export const startGame = async gameId => {
  try {
    const response = await fetch(`${SERVER_URL}/start/${gameId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    const game = await response.json();
    return game;
  } catch (error) {
    alert(error.message);
  }
};

export const getCard = async (userId, gameId) => {
  const response = await fetch(`${SERVER_URL}/game/${gameId}/card?userId=${userId}`);
  const card = await response.json();
  return card;
};
