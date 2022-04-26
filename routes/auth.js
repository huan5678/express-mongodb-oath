var express = require('express');
var router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const passport = require('passport');

const google_redirect_url = process.env.GOOGLE_REDIRECT_URL;
const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;

router.get('/google', (req, res) =>
{
  const query = {
    redirect_uri: google_redirect_url,
    client_id: google_client_id,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ')
  }
  const auth_url = 'https://accounts.google.com/o/oauth2/auth'
  const queryString = new URLSearchParams(query).toString();
  res.redirect(`${auth_url}?${queryString}`)
});

router.get('/google/callback', async (req, res) =>
{

  // 取得token
  const code = req.query.code;
  const options = {
    code,
    clientId: google_client_id,
    clientSecret: google_client_secret,
    redirectUri: google_redirect_url,
    grant_type: 'authorization_code'
  }
  const url = 'https://oauth2.googleapis.com/token';
  const queryString = new URLSearchParams(options).toString();
  const response = await axios.post(url, queryString);

  //利用tokne取得需要的資料
  const { id_token, access_token } = response.data

  const getData = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    {
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    }
  )
  res.redirect('/auth/success');
});


router.get('/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));
router.get('/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/auth/success',
    failureRedirect: '/error',
    session: false
  }));

// router.get('/facebook', (req, res) =>
// {
//   const query = {
//     redirect_uri: facebook_redirect_url,
//     client_id: facebook_clientId,
//     scope: ['public_profile', 'email']
//   }
//   const auth_url = 'https://www.facebook.com/v2.10/dialog/oauth';
//   const queryString = new URLSearchParams(query).toString();
//   res.redirect(`${auth_url}?${queryString}`);
// });

// router.get('/facebook/callback', async (req, res) =>
// {
//   const code = req.query.code;
//   const options = {
//     code,
//     client_id: facebook_clientId,
//     client_secret: facebook_clientSecret,
//     redirect_uri: facebook_redirect_url,
//   }
//   const url = 'https://graph.facebook.com/v2.10/oauth/access_token';
//   const queryString = new URLSearchParams(options).toString();
//   const response = await axios.post(url, queryString);

//   const { access_token, token_type, expires_in } = response.data;

//   console.log(access_token);
//   console.log(token_type);
//   console.log(expires_in);
//   // const getData = await axios.get(
//   //   `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
//   //   {
//   //     headers: {
//   //       Authorization: `Bearer ${id_token}`
//   //     }
//   //   }
//   // )
//   // res.redirect('/auth/success');
// });

router.get('/success', (req, res) =>
{
  res.send('get data from google successfully')
})

router.get('error', (req, res) =>
{
  res.send('get data from failed')
})

module.exports = router;
