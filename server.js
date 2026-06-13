require('dotenv').config();
const express = require('express');
const Router = require('./routes/v1Routes');

// synchronous global error handler
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception Error:' + err.stack);
  process.exit(1);
});

const app = express();
const { errorHandler } = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const connectDB = require('./config/db');
const { default: rateLimit } = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet'); // filter data from headers,
const cookieParser = require('cookie-parser');

// redis client
const redisClient = require('./config/redisClient');

// vercel cannot run listen function, so here invoke connectDB and redisClient.connect()
connectDB();
redisClient.connect();

// security middleware
app.use(helmet());

// json middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// cookie-parser
app.use(cookieParser());

// define query parser
app.set('query parser', 'extended'); // object

// rate limit
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    messasge: 'Too many requests from this IP, please try again later',
  }),
);

// test
app.get('/', (req, res) => {
  res.send('Hello, Pai');
});

app.use(express.static('public'));
app.use(morgan('dev')); // show api request as log

// main route
app.use('/api/v1', Router);

// global route
app.use(notFound);

// global error handler
app.use(errorHandler);

// const PORT = ;

if (!process.env.vercel) {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`ExpressJS server running on ${process.env.PORT}...`);
  });
}

module.exports = app;

// async global error handler
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection Error: ' + err.stack);
  process.exit(1);
});
