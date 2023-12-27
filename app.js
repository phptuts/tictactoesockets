const { WebSocketServer, OPEN } = require("ws");

const wss = new WebSocketServer({ port: 3000 });

let serverState = {
  board: [null, null, null, null, null, null, null, null, null],
  isOver: false,
  winner: "",
  turn: "X",
  subtitle: "X's turn!",
};

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    const action = JSON.parse(data.toString());
    if (!action) return;
    serverState = gameReducer(serverState, action);
    wss.clients.forEach((c) => {
      if (c.readyState === OPEN) {
        c.send(JSON.stringify(serverState));
      }
    });
  });
  ws.send(JSON.stringify(serverState));
  console.log("connected");
});

function gameReducer(state, action) {
  switch (action.type) {
    case "MOVE":
      const index = +action.payload;
      // If the game is over return the current or the space is already taken
      if (state.isOver || state.board[index]) {
        return { ...state };
      }

      state.board[index] = state.turn;
      state.turn = state.turn == "X" ? "O" : "X";
      state.subtitle = `${state.turn}'s turn!`;

      if (checkForWinner(state.board, "X")) {
        state.isOver = true;
        state.subtitle = `X won!`;
      } else if (checkForWinner(state.board, "O")) {
        state.isOver = true;
        state.subtitle = `O won!`;
      } else if (isTieGame(state.board)) {
        state.isOver = true;
        state.subtitle = "Tie Game!";
      }

      return { ...state };
    case "NEW_GAME":
      return {
        board: [null, null, null, null, null, null, null, null, null],
        isOver: false,
        winner: "",
        turn: "X",
        subtitle: "X's turn!",
      };
    default:
      return { ...state };
  }
}

function isTieGame(board) {
  return board.filter((x) => x !== null).length == 9;
}

function checkForWinner(board, player) {
  const winners = [
    `${board[0]}${board[1]}${board[2]}`,
    `${board[3]}${board[4]}${board[5]}`,
    `${board[6]}${board[7]}${board[8]}`,
    `${board[0]}${board[3]}${board[6]}`,
    `${board[1]}${board[4]}${board[7]}`,
    `${board[2]}${board[5]}${board[8]}`,
    `${board[0]}${board[4]}${board[8]}`,
    `${board[6]}${board[4]}${board[2]}`,
  ];
  const winningString = `${player}${player}${player}`;
  for (let checkString of winners) {
    if (winningString === checkString) {
      return true;
    }
  }

  return false;
}
