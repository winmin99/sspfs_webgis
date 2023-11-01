import 'dotenv/config';
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { engine } from 'express-handlebars';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import postgresql from './middlewares/postgresql/index';
import session from 'express-session';
import connect_pg_simple from 'connect-pg-simple';
import csrf from 'csurf';
import rateLimiter from './middlewares/rate-limiter/index';
import cors from 'cors';
import passport from 'passport';
import fs from 'fs';
import passportSetup from './middlewares/passport/index';
import routes from './routes/index';

const app = express();


// view engine setup
/**
 * @default ./views/layouts a Handlebars template with a {{{body}}} placeholder.
 * @default /views/partials
 * @link https://github.com/express-handlebars/express-handlebars
 * @example https://github.com/express-handlebars/express-handlebars/tree/master/examples/advanced
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', engine({ extname: '.html' }));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const csrfOptions = {
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
  },
};
app.use(csrf(csrfOptions));

const postgresqlSession = connect_pg_simple(session);
const sessionOptions = {
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: false,
  store: new postgresqlSession({
    pool: postgresql.pool,
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: 'auto',
  },
};
app.use(session(sessionOptions));

app.use(rateLimiter);
app.use(cors());
app.use(passport.initialize({}));
app.use(passport.session(false));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));

if (!fs.existsSync(path.join(__dirname, 'upload'))){
  fs.mkdirSync(path.join(__dirname, 'upload'));
}

passportSetup(passport);

const router = express.Router();
routes(router, passport);
app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    error: {
      status: err.status,
      message: res.locals.message,
    },
  });
});

export default app;
