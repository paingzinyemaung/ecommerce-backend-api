const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 15000, // Timeout ကို ၁၅ စက္ကန့်အထိ တိုးမြှင့်ပေးလိုက်ပါ
    keepAlive: 5000,
    reconnectStrategy: (retries) => {
      // ပြတ်သွားရင် အလိုအလျောက် အကြိမ်ကြိမ် ပြန်ချိတ်မယ့် စနစ်ပါ
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on('ready', () => {
  console.log('Redis client is ready');
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// redisClient.connect();

module.exports = redisClient;
