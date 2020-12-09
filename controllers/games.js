const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserScore = require('../models/userScore');
const GameDetail = require('../models/gameDetail');
const { SchemaTypes } = require('mongoose');

let players;
let scores

exports.show = async (ws, req, wss) => {
  const { secret_token } = req.params;
  if (!secret_token) ws.close(1008, "Cannot connect to the game");

  const decoded = jwt.verify(secret_token, 'any salty secret here');
  const user = await User.findById(decoded.user._id);

  if (user) {
    // Get the game
    let game = await GameDetail.find();
    if (!game || game.length === 0) game = await GameDetail.create({});
    console.log(game);

    ws.on('open', () => console.log("A new client is connected."));

    players = await User.find({ loggedIn: true }) || [];
    players = players.map(player => player.name);

    scores = await UserScore.find().populate({
      path: 'user',
      select: 'name email -_id'
    });

    ws.send(JSON.stringify({
      game: {
        message: {
          message: "Welcome to the game!",
          type: "info"
        },
        scores,
        players
      }
    }));

    sendMessageToAll(wss, {
      game: {
        message: {
          message: "New player has joined!",
          type: "info"
        },
        scores,
        players
      }
    });

    ws.on('close', () => console.log("Disconnected"));
    ws.on('error', error => console.error(error));
    ws.on('message', async message => {
      return await handleGuess(game[0], user, message, ws, wss);
    });
  } else {
    ws.close(1008, "Cannot connect to the game");
  }
};

async function handleGuess (game, user, message, ws, wss) {
  const msg = JSON.parse(message);

  if (msg && msg.guess) {
    if (game && game.currentNumber === Number(msg.guess)) {
      const userScore = await UserScore.findOne({ user: user._id });

      if (userScore) {
        userScore.score += 1;
        await userScore.save();
      } else {
        await UserScore.create({ user: user._id, score: 1 });
      }

      const scores = await UserScore.find().populate({
        path: 'user',
        select: 'name email -_id'
      });

      sendMessageToAll(wss, {
        game: {
          message: {
            message: `${user.name} has won!`,
            type: "success"
          }, 
          scores,
          players
        }
      });

      game.currentNumber = GameDetail.randomInt();
      game.save();
    } else {
      ws.send(JSON.stringify({
        game: {
          message: {
            message: "You are wrong. Try again",
            type: "warning"
          },
          scores: await UserScore.find().populate({
            path: 'user',
            select: 'name email -_id'
          }),
          players
        }
      }));
    }
  }
}

function sendMessageToAll (wss, message) {
  const clients = wss.getWss().clients;

  for (let client of clients) {
    client.send(JSON.stringify(message));
  }
}