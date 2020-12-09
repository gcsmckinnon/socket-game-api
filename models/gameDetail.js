const mongoose = require('mongoose');

const GameDetailSchema = mongoose.Schema({
  currentNumber: {
    type: Number,
    default: randomInt
  }
}, {
  timestamps: true
});

function randomInt () {
  const min = 1;
  const max = 10;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

GameDetailSchema.statics.randomInt = randomInt;

module.exports = mongoose.model('GameDetail', GameDetailSchema);