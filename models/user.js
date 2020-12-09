const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    dropDups: true,
    validate: [
      {
        // value will be the email the user
        // is attempting to store
        validator: async function (value) {
          const emailCount = await this.model('User')
            .countDocuments({ email: value });
          return emailCount === 0;
        },
        message: props => `Please try a different username/password combination.`
      },
      {
        validator: function (value) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.toLowerCase());
        },
        message: props => `Please ensure your email address is in the correct format. The email you entered was ${props.value}`
      },
      {
        validator: function (value) {
          return this.emailConfirmation === value;
        },
        message: props => `Your email and email confirmation must match.`
      }
    ]
  }
}, {
  timestamps: true
});

UserSchema.virtual('emailConfirmation')
.get(function () {
  return this._emailConfirmation;
})
.set(function (value) {
  this._emailConfirmation = value;
});

UserSchema.virtual('password')
.get(function () {
  return this._password;
})
.set(function (value) {
  console.log(value, this.passwordConfirmation, this);
  if (value !== this.passwordConfirmation) {
    this.invalidate('password', 'Password and password confirmation must match');
  }
  this._password = value;
});

UserSchema.virtual('passwordConfirmation')
.get(function () {
  return this._passwordConfirmation;
})
.set(function (value) {
  this._passwordConfirmation = value;
});

UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});

module.exports = mongoose.model('User', UserSchema);