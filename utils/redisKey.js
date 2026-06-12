const redisKey = {
  // product
  products: "products",
  product: (id) => `product:${id}`,

  // user
  users: "users",
  user: (id) => `user:${id}`,
};

module.exports = redisKey;
