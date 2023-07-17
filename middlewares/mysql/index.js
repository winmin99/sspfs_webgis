import mysql from 'mysql2';

class Mysql {

  constructor(options) {
    if (Mysql.exists) {
      return Mysql.instance;
    }

    Mysql.instance = this;
    Mysql.exists = true;

    options = Object.assign({}, options);

    this._pool = mysql.createPool({
      host: process.env.MSHOST,
      port: process.env.MSPORT,
      user: process.env.MSUSER,
      password: process.env.MSPASSWORD,
      database: process.env.MSDATABASE,
    });

    return this;
  }

  get pool() {
    return this._pool;
  }

  static onError(err) {
    return new Error(err.code);
  }

  executeQuery(text, params) {
    return this._pool
      .promise()
      .query(text, params)
      .then(([result]) => {
        return result;
      });
    // .catch(Mysql.onError);
  }
}

export default new Mysql();
