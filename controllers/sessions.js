const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticate = (req, res, next) => {
  try {
    passport.authenticate('local', (error, user) => {
      if (error || !user) return next(error);

      req.login(user, { session: false }, async err => {
        if (err) return next(err);

        const body = { _id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, 'any salty secret here');

        return res.status(200).json({ token });
      });
    })(req, res, next);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await User.findOneAndUpdate({ _id: req.user._id }, { loggedIn: false });

    res.status(200).json({ message: "You were logged out successfully." });
  } catch (error) {
    console.error(error);
    next(error);
  }
};