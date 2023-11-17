import { default as main } from './main';
import { default as passportRoute } from './passport';
import { default as wtl } from './wtl';
import bodyParser from "body-parser";
import {router} from "express/lib/application";

export default function (router, passport) {
  const user = {
    id: 'admin',
    password: '1234',
    displayName: 'Bonghwa', // Add display name for testing
  };
  router.get('/',checkAuth, function (req, res) {
    if (!req.isAuthenticated()) {
      return res.render('index', {
        title: `홈 | ${process.env.ROLE_KO}도 조회시스템`,
        company_ko: process.env.COMPANY_KO,
        company_en: process.env.COMPANY_EN,
        role_ko: process.env.ROLE_KO,
        role_en: process.env.ROLE_EN,
        KAKAO_API_KEY: process.env.KAKAO_API_KEY,
        workspace: process.env.WORKSPACE,
      });
    } else {
      // Store the intended redirect path in the session
      req.session.redirectTo = req.originalUrl;
      return res.redirect('/login');
    }
  });

  router.post('/login', bodyParser.urlencoded({ extended: false }), (req, res) => {
    const id = req.body.user_id;
    const password = req.body.user_pwd;

    if (id === user.id && password === user.password) {
      // Manually set user in the session
      req.session.user = user;

      // Redirect to home page after successful login
      return res.redirect('/');
    } else {
      // Redirect to '/login' if login fails
      return res.redirect('/login');
    }
  });

  // Welcome page
  router.get('/welcome', checkAuth, function (req, res) {
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="http://localhost:3000/">Bonghwa Web Inquiry System</a>
    `);
  });

  router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      res.redirect('/login');
    });
  });

  // router.get('/auth/signin', passportRoute.index);
  // router.post('/auth/signin', function (req, res, next) {
  //   return passportRoute.login(req, res, next, passport);
  // });
  // router.post('/auth/signup', function (req, res, next) {
  //   return passportRoute.signUp(req, res, next, passport);
  // });
  // router.get('/auth/signout', passportRoute.signOut);

  router.get('/api/wtl/search', checkAuth, wtl.search, onError);
  router.get('/api/wtl/section', checkAuth, wtl.section, onError);
  router.get('/api/wtl/info', checkAuth, wtl.info, onError);
  router.get('/api/wtl/info/check', checkAuth, wtl.infoCheck, onError);
  router.get('/api/wtl/info/photo', checkAuth, wtl.infoPhoto, onError);
  router.get('/api/wtl/info/history', checkAuth, wtl.infoHistory, onError);

  function onError(err, req, res, next) {
    console.error(err.stack);
    console.error(`[REQUEST QUERY]: ${JSON.stringify(req.query, null, 2)}`);
    console.error(`[REQUEST BODY]: ${JSON.stringify(req.body, null, 2)}`);
    res.status(400).json(err.stack.match('[\n]*.*'));
  }

  function checkAuth(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      // Store the intended redirect path in the session
      req.session.redirectTo = req.originalUrl;
      return res.redirect('/login');
    }
  }
}
