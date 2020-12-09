const mongoose = require('mongoose');

const UserScoreSchema = mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  score: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserScore', UserScoreSchema);