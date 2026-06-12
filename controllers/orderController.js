const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('express-async-handler');
const { product } = require('../utils/redisKey');

// {products: [{product: 1, quantity: 2}, {product: 2, quantity: 1} ]} , product => product_id
// simple order create
// exports.createOrder = asyncHandler(async (req, res, next) => {
//   const { products } = req.body;

//   //   1. check products exist
//   if (!products || !Array.isArray(products) || products.length === 0) {
//     return next(new AppError('Products are required', 400));
//   }

//   let orderItems = [];
//   let totalPrice = 0;

//   //   2. check stock exist in database and calculate total price
//   for (const item of products) {
//     const product = await Product.findById(item.product);

//     if (!product) {
//       return next(new AppError(`Product ${item.product} not found`, 404));
//     }

//     if (product.stock < item.quantity) {
//       return next(
//         new AppError(`${product.name} မှာ လက်ကျန် Stock မလုံလောက်ပါ။`, 400),
//       );
//     }

//     totalPrice += product.price * item.quantity;

//     orderItems.push({
//       product: item.product,
//       quantity: item.quantity,
//       priceAtPurchase: product.price,
//     });

//     // product.stock -= item.quantity;
//     // await product.save();
//   }

//   //  3. find profile id of logined user and check balance
//   const user = await User.findOne({ account: req.user.id });

//   if (!user) {
//     return next(
//       new AppError('User profile not found. Please create first', 400),
//     );
//   }

//   if (user.balance < totalPrice) {
//     return next(new AppError('Insufficient balance', 400));
//   }

//   user.balance -= totalPrice;
//   await user.save();

//   // 4. created order
//   const order = new Order({
//     user: user._id,
//     products: orderItems,
//     totalPrice,
//   });

//   await order.save();

//   for (const item of orderItems) {
//     const product = await Product.findById(item.product);
//     product.stock -= item.quantity;
//     await product.save();
//   }

//   res.status(200).json({
//     ok: true,
//     message: 'Order placed successfully',
//     order,
//   });

//   // bad practice, race condition, rollback problem
// });

// improved order create
// exports.createOrder = asyncHandler(async (req, res, next) => {
//   const { products } = req.body;

//   //   1. check products exist
//   if (!products || !Array.isArray(products) || products.length === 0) {
//     return next(new AppError('Products are required', 400));
//   }

//   let orderItems = [];
//   let totalPrice = 0;

//   //   2. check stock exist in database and calculate total price
//   // race condition problem, if two user order same product at same time, stock may be negative, solution is using transaction or lock, but here we use findOneAndUpdate with stock check to avoid negative stock, if stock is not enough, it will return null and we can handle it in code
//   for (const item of products) {
//     const product = await Product.findOneAndUpdate(
//       { _id: item.product, stock: { $gte: item.quantity } },
//       { $inc: { stock: -item.quantity } },
//       { new: true },
//     );

//     if (!product) {
//       // restore stock for previous items
//       for (const prevItem of orderItems) {
//         await Product.findByIdAndUpdate(prevItem.product, {
//           $inc: { stock: prevItem.quantity },
//         });
//       }
//       return next(
//         new AppError(
//           `Product ${item.product} not found or not enough stock`,
//           404,
//         ),
//       );
//     }

//     // if (product.stock < item.quantity) {
//     //   return next(
//     //     new AppError(`${product.name} မှာ လက်ကျန် Stock မလုံလောက်ပါ။`, 400),
//     //   );
//     // }

//     totalPrice += product.price * item.quantity;

//     orderItems.push({
//       product: item.product,
//       quantity: item.quantity,
//       priceAtPurchase: product.price,
//     });
//   }

//   //  3. find profile id of logined user and check balance
//   const user = await User.findOne({ account: req.user.id });

//   if (!user) {
//     return next(
//       new AppError('User profile not found. Please create first', 400),
//     );
//   }

//   if (user.balance < totalPrice) {
//     // restore stock for all items
//     for (const prevItem of orderItems) {
//       await Product.findByIdAndUpdate(prevItem.product, {
//         $inc: { stock: prevItem.quantity },
//       });
//     }
//     return next(new AppError('Insufficient balance', 400));
//   }

//   user.balance -= totalPrice;
//   await user.save();

//   // 4. created order
//   const order = new Order({
//     user: user._id,
//     products: orderItems,
//     totalPrice,
//   });

//   await order.save();

//   res.status(200).json({
//     ok: true,
//     message: 'Order placed successfully',
//     order,
//   });

//   // bad practice, race condition, rollback problem
// });

// best practice, using transaction to ensure atomicity, if any step fails, the whole transaction will be rolled back, no need to manually restore stock or balance
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { products } = req.body;

  // check products exist
  if (!products || !Array.isArray(products) || products.length === 0) {
    return next(new AppError('Products are required', 400));
  }

  //
  const session = await Order.startSession();
  session.startTransaction();

  let orderItem = [];
  let totalPrice = 0;

  try {
    for (const item of products) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { returnDocument: 'after', session },
      );

      if (!product) {
        throw new AppError(
          `Product ${item.product} not found or not enough stock`,
          404,
        );
      }

      totalPrice += product.price * item.quantity;

      orderItem.push({
        product: item.product,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    // const user = await User.findOne({ account: req.user.id }).session(session);
    const user = await User.findOneAndUpdate(
      { account: req.user.id, balance: { $gte: totalPrice } },
      { $inc: { balance: -totalPrice } },
      { returnDocument: 'after', session },
    );

    if (!user) {
      throw new AppError('User profile not found. Please create first', 400);
    }

    if (user.balance < totalPrice) {
      throw new AppError('Insufficient balance', 400);
    }

    // user.balance -= totalPrice;
    // await user.save({ session }); // temporary save to database, if any error occurs, it will be rolled back

    const order = await Order.create(
      [
        {
          user: user._id,
          products: orderItem,
          totalPrice,
        },
      ],
      { session },
    );

    // await order.save({ session });

    await session.commitTransaction(); // if all operations are successful, commit the transaction, otherwise it will be rolled back
    session.endSession();

    res.status(200).json({
      ok: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});
