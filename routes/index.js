import { default as main } from './main';
import { default as passportRoute } from './passport';
import { default as wtl } from './wtl';
import { default as swl } from './swl';
import { default as service } from './service';
import { default as data } from './data';

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

  router.get('/api/swl/search', swl.search, onError);
  router.get('/api/swl/info', swl.info, onError);
  router.get('/api/swl/info/check', swl.infoCheck, onError);
  router.get('/api/swl/info/photo', swl.infoPhoto, onError);
  router.get('/api/swl/info/history', swl.infoHistory, onError);

  router.get('/api/wtl/search', wtl.search, onError);
  router.get('/api/wtl/section', wtl.section, onError);
  router.get('/api/wtl/info', wtl.info, onError);
  router.get('/api/wtl/info/check', wtl.infoCheck, onError);
  router.get('/api/wtl/info/photo', wtl.infoPhoto, onError);
  router.get('/api/wtl/info/history', wtl.infoHistory, onError);

  router.get('/service/presmanage', service.presManageGet, onError);
  router.get('/service/schedule', service.scheduleGet, onError);
  router.get('/service/schedule/memo', service.scheduleMemoGet, onError);
  router.get('/service/register', service.registerGet, onError);
  router.get('/service/register/schedule', service.registerScheduleGet, onError);
  router.post('/service/register', service.registerPost, onError);

  router.get('/service/search', service.searchGet, onError);
  router.post('/service/search', service.searchPost, onError);

  router.get('/data/storage', data.dataStorageGet, onError);
  router.get('/data/storage/list', data.dataStorageListGet, onError);
  router.post('/data/storage/list/delete', data.dataStorageDeletePost, onError);
  router.get('/data/storage/download', data.dataStorageDownloadGet, onError);
  router.post('/data/storage/upload', data.dataStorageUploadPost, onError);

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
