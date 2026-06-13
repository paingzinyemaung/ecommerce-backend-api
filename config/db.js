const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return; // အကယ်၍ ချိတ်ဆက်ပြီးသားဖြစ်နေရင် ထပ်မချိတ်ဘဲ ဒီအတိုင်းပြန်ထွက်မယ်
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
