export default {
  index(req, res, next) {
    res.render('signin', {
      title: '로그인 | 상수도 조회시스템',
      _csrfToken: req.csrfToken(),
    });
  },

  login(req, res, next, passport) {
    passport.authenticate('local-signin', signInUser)(req, res, next);

    function signInUser(err, user, info) {
      req.login(user, function (err) {
        if (err) {
          return res.status(403).json({
            message: '등록되지 않은 아이디이거나, 잘못된 비밀번호입니다.',
          });
        } else {
          return res.status(200).json({});
        }
      });
    }
  },

  signUp(req, res, next, passport) {
    passport.authenticate('local-signup', signUpUser)(req, res, next);

    function signUpUser(err, user, info) {
      if (err) {
        return res.status(400).json({
          message: '계정 생성에 실패하였습니다. 관리자에게 문의바랍니다.',
        });
      } else {
        if (info === false) {
          return res
            .status(400)
            .json({ message: '이미 사용중인 아이디입니다.' });
        } else {
          return res.status(200).json({
            message: '등록한 계정은 관리자의 승인 후 사용이 가능합니다.',
          });
        }
      }
    }
  },

  signOut(req, res, next) {
    req.session.destroy(function (err) {
      req.logOut();
      res.redirect('/auth/signin');
    });
  },
};
