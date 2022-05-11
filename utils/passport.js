const passport = require('passport');
const strategy = require('passport-facebook');
const User = require('../models/user');
const successHandle = require('../utils/successHandle');

const FacebookStrategy = strategy.Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      // callbackURL: process.env.FACEBOOK_REDIRECT_URL,
      callbackURL: 'http://localhost:3000/account/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'username', 'displayName'],
    },

    async function (accessToken, refreshToken, profile, done) {
      const id = profile.id;
      let lastName, firstName;
      if (profile.name.familyName) {
        lastName = profile.name.familyName;
      }
      if (profile.name.givenName) {
        firstName = profile.name.givenName;
      }
      const name = lastName + firstName;
      const email = profile.emails[0].value;
      console.log('profile = ', profile);
      console.log('id: ', id, 'name: ', name, 'email: ', email);
      const user = await User.findOne({'thirdPartyAuthor.facebookId': id});

      if (!user) {
        const facebookData = {
          name: name,
          'thirdPartyAuthor.facebookId': id,
          email: email,
        };
        const userData = await User.create(facebookData);
        successHandle(res, '已成功已登入', userData);
      }

      successHandle(res, '已成功已登入', user);
      // const user = await User.findOne({ fbID: id });
      // if (!user) {
      //   const user = new User({ fbID: id, name, email });
      //   await user.save();
      //   console.log('Facebook profile data stored in database');
      // }
      done(null, profile);
    }
  )
);
