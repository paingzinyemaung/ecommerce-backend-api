const router = require('express').Router();
const authRoute = require('./authRoutes');
const userRoute = require('./userRoutes');
const productRoute = require('./productRoutes');
const orderRoute = require('./orderRoutes');

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/products', productRoute);
router.use('/orders', orderRoute);

module.exports = router;
