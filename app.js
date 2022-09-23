const path = require('path');
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const cookieParser = require('cookie-parser');
const bookingController = require('./controllers/bookingController');
//const cors = require('cors');

const cors = require('cors');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
//Start express app
app = express();

app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//1) GLOBAL MIDDLEWARES
//Implement CORS
app.use(cors());
//Access-Control-allow-Origin *
app.options('*', cors());
//Serving static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
//Development logging
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//Set security HTTP headers
//app.use(helmet());

app.use(helmet());
csp.extend(app, {
  policy: {
    directives: {
      'default-src': ['self'],
      'style-src': ['self', 'unsafe-inline', 'https:'],
      'font-src': ['self', 'https://fonts.gstatic.com'],
      'script-src': [
        'self',
        'unsafe-inline',
        'data',
        'blob',
        'https://js.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:8828',
        'ws://localhost:56558/',
      ],
      'worker-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'frame-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'img-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'connect-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'wss://git.herokuapp.com:`${process.env.PORT}`/',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
    },
  },
});

// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

//Lmit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //Middleware
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

//Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });
// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint ...');
// });
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });
//Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
//
// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//Modified here ...
app.use('/api/v1/bookings', bookingRouter);
//Added this to remove content security policy
//app.use(helmet({ contentSecurityPolicy: false }));-a
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server`), 404);
  //   app.all('*', (req, res, next) => {
  //   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  // });
  // res.status(400).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this Server`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this Server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
});
app.use(globalErrorHandler);
module.exports = app;

//Git Token valid for 30 days from 19th Sept. 2022
//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
// "watch:js": "parcel watch ./public/js/index.js --out-dir ./public/js --out-file bundle.js --public-url /js",
