const router = require('express').Router();
const { createOrder } = require('../controllers/orderController');
const { verifyJwt, allowTo } = require('../middlewares/authMiddleware');

router.post('/', verifyJwt, allowTo('admin'), createOrder);

module.exports = router;
