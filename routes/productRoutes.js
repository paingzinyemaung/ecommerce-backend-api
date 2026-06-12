const { verify } = require('jsonwebtoken');
const { verifyJwt, allowTo } = require('../middlewares/authMiddleware');
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require('../controllers/productController');

const router = require('express').Router();
const upload = require('../middlewares/fileUpload');

router.post(
  '/',
  verifyJwt,
  allowTo('admin'),
  upload.single('image'), // 'image' is the field name in the form-data
  createProduct,
);

router.get('/', verifyJwt, getAllProducts);
router.get('/:id', verifyJwt, getProductById);

module.exports = router;
