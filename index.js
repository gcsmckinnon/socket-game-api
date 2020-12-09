require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

// Mongo access
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI, {
  auth: {
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).catch(err => console.error(`Error: ${err}`));

// Implement Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup our session
const passport = require('passport');
const session = require('express-session');
app.use(session({
  secret: 'any salty secret here',
  resave: true,
  saveUninitialized: false
}));

// Setting up Passport
app.use(passport.initialize());
app.use(passport.session());
const User = require('./models/user');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Setting up Passport JWT
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(new JWTstrategy({
  secretOrKey: 'any salty secret here',
  jwtFromRequest: ExtractJWT.fromExtractors([
    ExtractJWT.fromUrlQueryParameter('secret_token'),
    ExtractJWT.fromBodyField('secret_token')
  ])
}, async (token, done) => {
  try {
    return done(null, token.user);
  } catch (error) {
    done(error);
  }
}));

// setting up the websocket routing system
const expressWS = require('express-ws')(app);

// register the routes
const routes = require('./routes');
const router = routes(express.Router(), expressWS);
app.use(router);

// error handling
const { handle404s, errorHandler } = require('./errorHandling');
app.use(handle404s);
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Always watching... on port 4000"));