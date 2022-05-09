const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const apiSecret = process.env.AUTH_SECRET;

const handleErrorAsync = require('../utils/handleErrorAsync');
const successHandle = require('../utils/successHandle');
const appError = require('../utils/appError');

const passport = require('passport');
const { v4: uuidv4 } = require('uuid');

const google_redirect_url = process.env.GOOGLE_REDIRECT_URL;
const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;

router.post('/sign-up',handleErrorAsync(async (req, res, next) => {
  let {email, password, confirmPassword, name} = req.body;
  if (!email || !password || !confirmPassword || !name) {
    return appError(400, '欄位未正確填寫', next);
  }
  /*
  * 使用正規表達式檢測email
  const emailRules = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  if (!emailRules.test(email)) {
    return appError(400, '請正確輸入 email 格式', next);
  }
  */
  if (!validator.isEmail(email)) {
    return appError(400, '請正確輸入 email 格式', next);
  }
  const passwordRules = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/gm;
  if (!passwordRules.test(password)) {
    return appError(400, '密碼強度不足，請確認是否具至少有 1 個數字， 1 個大寫英文， 1 個小寫英文及 1 個特殊符號，密碼長度需超過 8 個字', next);
  }
  if (password !== confirmPassword) {
    return appError(400, '請確認兩次輸入的密碼是否相同', next);
  }
  const salt = bcrypt.genSaltSync(8);
  password = bcrypt.hashSync(req.body.password, salt)
  console.log(password)
  next();
  }
))

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


const line_redirect_url = process.env.LINE_REDIRECT_URL;
const line_channel_id = process.env.LINE_CHANNEL_ID;
const line_channel_secret = process.env.LINE_CHANNEL_SECRET;
const line_state = 'mongodb-express-line-login';

router.get('/line', (req, res) =>
{
  const query = {
    response_type: 'code',
    client_id: line_channel_id,
    redirect_uri: line_redirect_url,
    state: line_state,
    scope: 'profile',
    nonce: uuidv4(),
  }
  const auth_url = 'https://access.line.me/oauth2/v2.1/authorize'
  const queryString = new URLSearchParams(query).toString();
  res.redirect(`${auth_url}?${queryString}`)
});

router.get('/line/callback', async (req, res) =>
{
  const code = req.query.code;
  const options = {
    code,
    client_id: line_channel_id,
    client_secret: line_channel_secret,
    redirect_uri: line_redirect_url,
    state: line_state,
    grant_type: 'authorization_code',
  }
  const tokenHeader = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  const url = 'https://api.line.me/oauth2/v2.1/token';
  const queryString = new URLSearchParams(options).toString();
  const response = await axios.post(url, queryString, {
    headers: tokenHeader
  });

  const { access_token } = response.data;

  console.log('data = ', response.data);
  console.log('access = ', access_token);

  const getVerify = await axios.get(
    `https://api.line.me/oauth2/v2.1/verify?access_token=${access_token}`,
  )
  const getProfile = await axios.get(
    'https://api.line.me/v2/profile',
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      }
    }
  )
  res.send(
    {
      verify: getVerify.data,
      profile: getProfile.data,
    }
  );
  // res.redirect('/auth/success');
});

const github_redirect_url = process.env.GITHUB_REDIRECT_URL;
const github_client_id = process.env.GITHUB_CLIENT_ID;
const github_client_secret = process.env.GITHUB_CLIENT_SECRET;
const github_state = 'mongodb-express-github-login';

router.get('/github', (req, res) =>
{
  const query = {
    client_id: github_client_id,
    redirect_uri: github_redirect_url,
    scope: 'user',
    state: github_state,
  }
  const auth_url = 'https://github.com/login/oauth/authorize'
  const queryString = new URLSearchParams(query).toString();
  res.redirect(`${auth_url}?${queryString}`)
});

router.get('/github/callback', async (req, res) =>
{
  const code = req.query.code;
  const options = {
    code,
    client_id: github_client_id,
    client_secret: github_client_secret,
    redirect_uri: github_redirect_url,
  }
  const url = 'https://github.com/login/oauth/access_token';
  const queryString = new URLSearchParams(options).toString();
  const response = await axios.post(url, queryString, {
    headers: {
      Accept: 'application/json',
    },
  });

  console.log(response.data);
  const { access_token } = response.data;

  const getVerify = await axios.get(
    `https://api.github.com/user`,
    {
      headers: {
        Authorization: `token ${access_token}`,
      },
    }
  )
  console.log(getVerify.data);
  res.send(
    {
      verify: getVerify.data,
    }
  );
});


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
// });


router.get('/success', (req, res) =>
{
  res.send('get data from successfully')
})

router.get('error', (req, res) =>
{
  res.send('get data from failed')
})

module.exports = router;
