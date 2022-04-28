const passport = require('passport');
const strategy = require('passport-facebook');

const FacebookStrategy = strategy.Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_REDIRECT_URL,
      profileFields: ['id', 'emails', 'name']
    },

    async function (accessToken, refreshToken, profile, done)
    {

      const id = profile.id;
      const name = profile.displayName;
      const email = profile.emails[0].value;
      console.log('id: ', id, 'name: ', name, 'email: ', email)
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