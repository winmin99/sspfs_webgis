import { default as main } from './main';
import { default as passportRoute } from './passport';
import { default as wtl } from './wtl';

export default function (router, passport) {
  router.get('/', main.index);

  router.get('/auth/signin', passportRoute.index);
  router.post('/auth/signin', function (req, res, next) {
    return passportRoute.login(req, res, next, passport);
  });
  router.post('/auth/signup', function (req, res, next) {
    return passportRoute.signUp(req, res, next, passport);
  });
  router.get('/auth/signout', passportRoute.signOut);

  router.get('/api/wtl/search', wtl.search, onError);
  router.get('/api/wtl/section', wtl.section, onError);
  router.get('/api/wtl/info', wtl.info, onError);
  router.get('/api/wtl/info/check', wtl.infoCheck, onError);
  router.get('/api/wtl/info/photo', wtl.infoPhoto, onError);
  router.get('/api/wtl/info/history', wtl.infoHistory, onError);


  function onError(err, req, res, next) {
    console.error(err.stack);
    console.error(`[REQUEST QUERY]: ${JSON.stringify(req.query, null, 2)}`);
    console.error(`[REQUEST BODY]: ${JSON.stringify(req.body, null, 2)}`);
    res.status(400).json(err.stack.match('[\n]*.*'));
  }

  function checkAuth(req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect('/auth/signin');
    } else {
      next();
    }
  }
}
