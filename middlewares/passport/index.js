import LocalStrategySignIn from './local-strategy-signin';
import LocalStrategySignup from './local-strategy-signup';

export default function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  passport.use('local-signin', LocalStrategySignIn);
  passport.use('local-signup', LocalStrategySignup);
}
