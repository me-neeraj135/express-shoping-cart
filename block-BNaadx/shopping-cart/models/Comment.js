/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;

let commentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    itemId: { type: Schema.Types.ObjectId, ref: `Item` },
  },
  { timestamps: true }
);

module.exports = mongoose.model(`Comment`, commentSchema);
