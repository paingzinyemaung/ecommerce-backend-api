// const mongoose = require("mongoose");
// // const path = require("path");
// // require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     // console.log("Connected to MongoDB");
//   } catch (err) {
//     console.error(err.message);
//   }

//   // const userSchema = new mongoose.Schema({
//   //   name: String,
//   //   age: Number,
//   //   job: String,
//   // });

//   // const User = mongoose.model("User", userSchema); // model
//   // const users = await User.find(); // collection
//   // console.log(users);
// };

// module.exports = connectDB;

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
