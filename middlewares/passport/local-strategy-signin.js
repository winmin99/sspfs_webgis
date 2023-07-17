import passportLocal from 'passport-local';
import postgresql from '../postgresql/index';
import bcrypt from 'bcryptjs';

function onPassportLocalSignIn(req, username, password, done) {
  const sqlSelectUsernameAndStatus = `
      SELECT user_tb.username     AS "LoginName",
             membership_tb.active AS "Status"
      FROM private.sys_login AS login_tb
               LEFT JOIN private.sys_user AS user_tb ON login_tb.userid_fk = user_tb.id
               LEFT JOIN private.sys_membership AS membership_tb ON user_tb.id = membership_tb.userid_fk
      WHERE login_tb.username = $1
      LIMIT 1
  `;

  postgresql
    .executeQuery(sqlSelectUsernameAndStatus, [username])
    .then(isNotNull)
    .then(isActivatedUser)
    .then(onAuthenticateUser);

  function isNotNull(result) {
    if (result.rowCount === 0) {
      return done(/* TODO: error */);
    } else {
      return result;
    }
  }

  function isActivatedUser(result) {
    if (result.rows[0]['Status'] === false) {
      return done(/* TODO: error*/);
    } else {
      return true;
    }
  }

  function onAuthenticateUser() {
    const sqlSelectUserInfo = `
        SELECT login_tb.username       AS "LoginName",
               login_tb.password       AS "LoginKey",
               user_tb.lastname        AS "UserLastName",
               user_tb.firstname       AS "UserFirstName",
               role_tb.role_name       AS "RoleName",
               company_tb.company_name AS "CompanyName",
               company_tb.wtl          AS "CompanyWTL",
               company_tb.swl          AS "CompanySWL"
        FROM private.sys_login AS login_tb
                 LEFT JOIN private.sys_user AS user_tb ON login_tb.userid_fk = user_tb.id
                 LEFT JOIN private.sys_membership AS membership_tb ON user_tb.id = membership_tb.userid_fk
                 LEFT JOIN private.sys_role AS role_tb ON membership_tb.roleid_fk = role_tb.id
                 LEFT JOIN private.sys_company AS company_tb ON membership_tb.companyid_fk = company_tb.id
        WHERE login_tb.username = $1
    `;

    postgresql.executeQuery(sqlSelectUserInfo, [username])
      .then(onBcryptCompare);

    function onBcryptCompare(result) {
      const signIn = result.rows[0];
      bcrypt
        .compare(password, signIn['LoginKey'])
        .then(function (isMatch) {
          if (isMatch) {
            return done(null, {
              UserName: `${signIn['UserLastName']}${signIn['UserFirstName']}`,
              LoginName: signIn['LoginName'],
              CompanyName: signIn['CompanyName'],
              RoleName: signIn['RoleName'],
              CompanyWTL: signIn['CompanyWTL'],
              CompanySWL: signIn['CompanySWL'],
            });
          } else {
            return done(/* TODO: error*/);
          }
        })
        .catch(function (err) {
          return done(/* TODO: error*/);
        });
    }
  }
}

export default new passportLocal.Strategy(
  {
    usernameField: 'LoginName',
    passwordField: 'LoginKey',
    passReqToCallback: true,
  },
  onPassportLocalSignIn);
