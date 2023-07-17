import passportLocal from 'passport-local';
import postgresql from '../postgresql/index';
import bcrypt from 'bcryptjs';

function onPassportLocalSignUp(req, username, password, done) {
  const reqPayload = req.body;

  const sqlInsertNewUser = `
      WITH ins1 AS (INSERT INTO private.sys_user (firstname, lastname, username) VALUES ($1, $2, $3) RETURNING id),
           ins2
               AS (INSERT INTO private.sys_login (username, password, userid_fk) VALUES ($4, $5, (SELECT id FROM ins1))),
           sel1 AS (SELECT id FROM private.sys_company WHERE company_name = $6),
           sel2 AS (SELECT id FROM private.sys_role WHERE role_name = $7)
      INSERT
      INTO private.sys_membership (email, phone, userid_fk, companyid_fk, roleid_fk, active, reset)
      VALUES ($8, NULL, (SELECT id FROM ins1), (SELECT sel1.id FROM sel1), (SELECT sel2.id FROM sel2), FALSE, TRUE)
  `;

  bcrypt.hash(reqPayload['LoginKeyNew'], 10, function (err, hash) {
    const sqlInsertNewUserParams = [
      reqPayload['UserFirstName'],
      reqPayload['UserLastName'],
      reqPayload['LoginNameNew'],
      reqPayload['LoginNameNew'],
      hash,
      reqPayload['CompanyName'],
      reqPayload['RoleName'],
      // reqPayload['EmailNew'],
    ];

    postgresql.executeQuery(sqlInsertNewUser, sqlInsertNewUserParams)
      .then(function () {
        return done(null, true);
      })
      .catch(function () {
        return done(null, false);
      });
  });
}

function parseInsertParams(reqPayload) {
  bcrypt.hash(reqPayload['LoginKeyNew'], 10, function (err, hash) {
    return [
      reqPayload['UserFirstName'],
      reqPayload['UserLastName'],
      reqPayload['LoginNameNew'],
      reqPayload['LoginNameNew'],
      hash,
      reqPayload['CompanyName'],
      reqPayload['RoleName'],
      // reqPayload['EmailNew'],
    ];
  });
}

export default new passportLocal.Strategy(
  {
    usernameField: 'LoginNameNew',
    passwordField: 'LoginKeyNew',
    passReqToCallback: true,
  },
  onPassportLocalSignUp);
