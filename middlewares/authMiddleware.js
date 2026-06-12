const jwt = require('jsonwebtoken');
const Account = require('../models/accountModel');

exports.verifyJwt = async (req, res, next) => {
  let token = req.headers?.authorization?.split(' ')[1];
  // console.log(req.cookies);
  if (!token) {
    token = req.cookies?.token;
  }

  if (!token) {
    token = req.query?.token; // URL ထဲက ?token= ဆိုပြီး ရှာခိုင်းတာပါ
  }
  console.log(token);

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized: No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const account = await Account.findById(decoded.id);

    if (!account) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (account.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: 'Invalid Token' });
    }

    req.user = decoded;
    req.user.role = account.role;
    console.log(req.user.role);
    console.log(account.email);
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized',
    });
  }
  next();
};

// allowTo('admin', 'user')
exports.allowTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }
    next();
  };
};
