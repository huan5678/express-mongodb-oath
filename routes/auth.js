const express = require('express');
const User = require('../models/user');
const router = express.Router();
const axios = require('axios');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const jwtExpires = process.env.JWT_EXPIRES_DAY;

const asyncWrapper = require('../middleware/async');
const successHandle = require('../utils/successHandle');
const appError = require('../utils/appError');
const {isAuthor, generateToken} = require('../middleware/handleAuthor');

const passport = require('passport');
const {v4: uuidv4} = require('uuid');

router.post(
  '/account/create',
  asyncWrapper(async (req, res, next) => {
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
      return appError(
        400,
        '密碼強度不足，請確認是否具至少有 1 個數字， 1 個大寫英文， 1 個小寫英文及 1 個特殊符號，密碼長度需 8 個字以上',
        next
      );
    }
    if (password !== confirmPassword) {
      return appError(400, '請確認兩次輸入的密碼是否相同', next);
    }
    const userData = {
      name,
      email,
      password,
    };
    const checkUser = User.findOne({email}).exec();
    if (checkUser) {
      return appError(400, '此 email 已經被註冊過了，請在嘗試其他 email 或是點選忘記密碼', next);
    }
    await User.create(userData);
    return successHandle(res, '成功建立使用者帳號');
  })
);

router.post(
  '/account/login',
  asyncWrapper(async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) {
      return appError(400, 'email 或 password 欄位未正確填寫', next);
    }
    const user = await User.findOne({email});
    if (!user) {
      return appError(404, '無此使用者資訊請確認 email 帳號是否正確', next);
    }
    const userPassword = await User.findOne({email}).select('+password');
    const checkPassword = bcrypt.compare(req.body.password, userPassword);
    if (!checkPassword) {
      return appError(400, '請確認密碼是否正確，請再嘗試輸入', next);
    }
    const payload = {
      id: user._id,
      name: user.name,
      photo: user.photo,
    };
    const token = jwt.sign(payload, jwtSecret, {expiresIn: jwtExpires});
    return successHandle(res, '登入成功', token);
  })
);

router.get(
  '/account/test',
  isAuthor,
  asyncWrapper(async (req, res, next) => {
    console.log(req.user);
    successHandle(res, '驗證登入', req.user);
  })
);

// const google_redirect_url = process.env.GOOGLE_REDIRECT_URL;
const google_redirect_url = 'http://localhost:3000/account/google/callback';
const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;

router.get('/account/google', (req, res) => {
  const query = {
    redirect_uri: google_redirect_url,
    client_id: google_client_id,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };
  const auth_url = 'https://accounts.google.com/o/oauth2/auth';
  const queryString = new URLSearchParams(query).toString();
  res.redirect(`${auth_url}?${queryString}`);
});

router.get('/account/google/callback', async (req, res) => {
  const code = req.query.code;
  const options = {
    code,
    clientId: google_client_id,
    clientSecret: google_client_secret,
    redirectUri: google_redirect_url,
    grant_type: 'authorization_code',
  };
  const url = 'https://oauth2.googleapis.com/token';
  const queryString = new URLSearchParams(options).toString();
  const response = await axios.post(url, queryString);

  const {id_token, access_token} = response.data;

  const getData = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    }
  );
  const googleId = getData.data.id;
  const user = await User.findOne({'thirdPartyAuthor.googleId': googleId});

  if (!user) {
    const googleData = {
      name: getData.data.name,
      'thirdPartyAuthor.googleId': getData.data.id,
      email: getData.data.email,
      photo: getData.data.picture,
    };
    const userData = await User.create(googleData);
    successHandle(res, '已成功已登入', userData);
  }

  successHandle(res, '已成功已登入', user);
  // res.redirect('/auth/success');
});

router.get(
  '/account/facebook',
  passport.authenticate('facebook', {
    scope: ['public_profile', 'email', 'user_photos', 'user_gender'],
  })
);

router.get(
  '/account/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/auth/success',
    failureRedirect: '/error',
    session: false,
  })
);

// const line_redirect_url = process.env.LINE_REDIRECT_URL;
const line_redirect_url = 'http://localhost:3000/account/line/callback';
const line_channel_id = process.env.LINE_CHANNEL_ID;
const line_channel_secret = process.env.LINE_CHANNEL_SECRET;
const line_state = 'mongodb-express-line-login';

router.get('/account/line', (req, res) => {
  const query = {
    response_type: 'code',
    client_id: line_channel_id,
    redirect_uri: line_redirect_url,
    state: line_state,
    scope: 'profile',
    nonce: uuidv4(),
  };
  const auth_url = 'https://access.line.me/oauth2/v2.1/authorize';
  const queryString = new URLSearchParams(query).toString();
  res.redirect(`${auth_url}?${queryString}`);
});

router.get('/account/line/callback', async (req, res) => {
  const code = req.query.code;
  const options = {
    code,
    client_id: line_channel_id,
    client_secret: line_channel_secret,
    redirect_uri: line_redirect_url,
    state: line_state,
    grant_type: 'authorization_code',
  };
  const tokenHeader = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const url = 'https://api.line.me/oauth2/v2.1/token';
  const queryString = new URLSearchParams(options).toString();
  const response = await axios.post(url, queryString, {
    headers: tokenHeader,
  });

  const {access_token} = response.data;

  console.log('data = ', response.data);
  console.log('access = ', access_token);

  const getVerify = await axios.get(
    `https://api.line.me/oauth2/v2.1/verify?access_token=${access_token}`
  );
  const getProfile = await axios.get('https://api.line.me/v2/profile', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const lineUid = getProfile.data.userId;
  console.log(lineUid);
  const user = await User.findOne({'thirdPartyAuthor.lineId': lineUid});
  // console.log({
  //   verify: getVerify.data,
  //   profile: getProfile.data,
  // });

  if (!user) {
    const lineData = {
      name: getProfile.data.displayName,
      'thirdPartyAuthor.lineId': getProfile.data.userId,
      photo: getProfile.data.pictureUrl,
    };
    const userData = await User.create(lineData);
    successHandle(res, '已成功已登入', userData);
  }

  successHandle(res, '已成功已登入', user);

  // res.redirect('/account/success');
});

// const github_redirect_url = process.env.GITHUB_REDIRECT_URL;
const github_redirect_url = 'http://localhost:3000/account/github/callback';
const github_client_id = process.env.GITHUB_CLIENT_ID;
const github_client_secret = process.env.GITHUB_CLIENT_SECRET;
const github_state = 'mongodb-express-github-login';

router.get('/account/github', (req, res) => {
  const query = {
    client_id: github_client_id,
    redirect_uri: github_redirect_url,
    scope: 'user',
    state: github_state,
  };
  const auth_url = 'https://github.com/login/oauth/authorize';
  const queryString = new URLSearchParams(query).toString();
  res.redirect(`${auth_url}?${queryString}`);
});

router.get(
  '/account/github/callback',
  asyncWrapper(async (req, res, next) => {
    const code = req.query.code;
    const options = {
      code,
      client_id: github_client_id,
      client_secret: github_client_secret,
      redirect_uri: github_redirect_url,
    };
    const url = 'https://github.com/login/oauth/access_token';
    const queryString = new URLSearchParams(options).toString();
    const response = await axios.post(url, queryString, {
      headers: {
        Accept: 'application/json',
      },
    });

    console.log(response.data);
    const {access_token} = response.data;

    const getVerify = await axios.get(`https://api.github.com/user`, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    const name = getVerify.data.name || getVerify.data.login;
    const email = getVerify.data.email;
    if (!email) {
      return appError(400, 'github 帳號 email 未設定公開請確認是否設定開放', next);
    }
    console.log(getVerify.data);
    res.send({
      verify: getVerify.data,
    });
    const id = getVerify.data.id;
    const user = await User.findOne({'thirdPartyAuthor.githubId': id});

    if (!user) {
      const githubData = {
        name,
        'thirdPartyAuthor.githubId': id,
        email,
        photo: getVerify.data.avatar_url,
      };
      const userData = await User.create(githubData);
      successHandle(res, '已成功已登入', userData);
    }
    successHandle(res, '已成功已登入', user);
  })
);

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

router.get('/account/success', (req, res) => {
  res.send('get data from successfully');
});

module.exports = router;
