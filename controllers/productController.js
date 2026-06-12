const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');
const RedisClient = require('../config/redisClient');
const redisKey = require('../utils/redisKey');

// 1. create product
exports.createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, stock } = req.body;

  console.log(req.file);

  if (!req.file) {
    return next(new AppError('Product image is required!', 400));
  }

  if (!name || !description || price === undefined || stock === undefined) {
    return next(new AppError('All fields are required!', 400));
  }

  // get the unique filename from multer and save it to the database
  const imagePath = `/uploads/${req.file.filename}`;

  const newProduct = new Product({
    name,
    description,
    price,
    stock,
    filename: imagePath,
  });
  const savedProduct = await newProduct.save();

  res.status(201).json({
    ok: true,
    message: 'Product created successfully',
    data: savedProduct,
  });
});

// 2. get all products
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  // const features = new APIFeatures(Product.find(), req.query) // give mongoose query and query string
  //   .filter() // how to find (instruction list)
  //   .paginate()
  //   .limitFields()
  //   .sort();

  // const products = await features.query; // features.query -> how to find data from database, where collection of instruction

  let products = {};
  products = JSON.parse(await RedisClient.get(redisKey.products));

  if (!products) {
    products = await Product.find();
    await RedisClient.set(redisKey.products, JSON.stringify(products), {
      EX: 10, // expire in 10 seconds
    });
  }

  res.status(200).json({
    ok: true,
    message: 'Products retrieved successfully',
    count: products.length,
    data: products,
  });
});

// 3. get product by id
exports.getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let product = {};
  product = JSON.parse(await RedisClient.get(redisKey.product(id)));

  if (!product) {
    product = await Product.findById(id);
    await RedisClient.set(redisKey.product(id), JSON.stringify(product), {
      EX: 10, // expire in 10 seconds
    });
  }
  res.status(200).json({
    ok: true,
    message: 'Product retrieved successfully',
    data: product,
  });
});

// 4. update product
// 5. delete product
