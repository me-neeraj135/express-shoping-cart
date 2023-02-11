/** @format */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, unique: true },
    password: { type: String, minlength: 5, required: true },
    isAdmin: { type: Boolean, default: false, required: false },
    itemId: [{ type: Schema.Types.ObjectId, ref: "Item" }],
  },
  { timestamps: true }
);

// hash password

userSchema.pre(`save`, function (next) {
  if (this.password && this.isModified(`password`)) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      this.password = hashed;

      return next();
    });
  } else {
    next();
  }
});

// verify password

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

module.exports = mongoose.model(`User`, userSchema);
