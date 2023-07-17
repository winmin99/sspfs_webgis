import { Pool } from 'pg';

class Postgresql {

  constructor(options) {
    if (Postgresql.exists) {
      return Postgresql.instance;
    }

    Postgresql.instance = this;
    Postgresql.exists = true;

    options = Object.assign({}, options);

    this._pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    });

    return this;
  }

  get pool() {
    return this._pool;
  }

  static onError(err) {
    return new Error(err.code);
  }

  static onFinally(client) {
    if (client) {
      client.release();
    }
  }

  executeQuery(text, params) {
    return this._pool
      .connect()
      .then(client => {
        return client
          .query(text, params)
          .then(result => {
            return result;
          })
          // .catch(Postgresql.onError)
          .finally(() => Postgresql.onFinally(client));
      });
    // .catch(Postgresql.onError);
  }
}

export default new Postgresql();
