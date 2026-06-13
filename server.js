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

// Vercel Cloud ရဲ့ Proxy ဆာဗာကနေတစ်ဆင့် ဖြတ်လာတဲ့ အသုံးပြုသူတွေရဲ့ IP Address အစစ်အမှန် (Headers) တွေကို Express ကနေ "ယုံကြည်စိတ်ချစွာ ဖတ်ရှုခွင့်ပြုပါ" လို့ ခွင့်ပြုချက် ပေးလိုက်တာ
app.set('trust proxy', 1);

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

// ဒေတာဘေ့စ်နှစ်ခုလုံးကို Request တိုင်းမှာ အိပ်မပျော်စေဘဲ အမြဲတမ်း Live ဖြစ်နေစေမယ့် Middleware
app.use(async (req, res, next) => {
  try {
    // 1. MongoDB ချိတ်ဆက်မှုကို စစ်ဆေး/ချိတ်ဆက်ခြင်း
    await connectDB();

    // 2. Redis ချိတ်ဆက်မှုကို စစ်ဆေး/ချိတ်ဆက်ခြင်း
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(500).json({ message: 'Internal Server Database Error' });
  }
});

// main route
app.use('/api/v1', Router);

// global route
app.use(notFound);

// global error handler
app.use(errorHandler);

// // vercel cannot run listen function, so here invoke connectDB and redisClient.connect()
// connectDB();
// redisClient.connect();

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
