const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("ready", () => {
  console.log("Redis client is ready");
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// redisClient.connect();

module.exports = redisClient;
