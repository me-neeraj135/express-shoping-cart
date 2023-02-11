/** @format */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var itemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String, required: true },
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);
