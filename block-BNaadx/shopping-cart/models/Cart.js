/** @format */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    listItems: [{ type: Schema.Types.ObjectId, ref: "Item" }],
    itemQuantity: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
