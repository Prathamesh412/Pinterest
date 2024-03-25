const mongoose = require("mongoose");
const UserPlugin = require("passport-local-mongoose");

mongoose
  .connect(
    "mongodb+srv://prathprabhu:SiFTj0ZF5mQeEnUs@cluster0.ubiymxq.mongodb.net/"
  )
  .then(console.log("Database Connected"));

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  handlename: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
    default: "default-image.jpg",
  },
  boards: {
    type: Array,
    default: [],
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});
userSchema.plugin(UserPlugin);

module.exports = mongoose.model("user", userSchema);
