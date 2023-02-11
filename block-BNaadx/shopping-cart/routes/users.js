/** @format */

const { json } = require("express");
var express = require("express");
var router = express.Router();
var User = require(`../models/User`);
var Cart = require(`../models/Cart`);

/* GET users listing. */
router.get("/", function (req, res, next) {
  let error = req.flash(`error`);
  return res.send("user-login", { error });
});

// render login form

router.get(`/login`, (req, res, next) => {
  let error = req.flash(`error`)[0];
  return res.render(`user-login`, { error });
});

// login user

router.post(`/login`, (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    req.flash(`error`, `email/password required`);
    return res.redirect(`/users/login`);
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);

    // user as null
    if (!user) {
      req.flash(`error`, `user not found`);
      return res.redirect(`/users/login`);
    }

    // verify password
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);

      // result as false
      if (!result) {
        req.flash(`error`, `invalid password`);
        return res.redirect(`/users/login`);
      }
      // persist session

      req.session.userId = user.id;
      req.session.user = user;
      if (user.isAdmin) {
        return res.redirect(`/admin/${user.id}`);
      }
      req.flash(`error`, `request successful`);
      return res.redirect(`/`);
    });
  });
});

// list user cart

router.get(`/:id/list-cart`, (req, res, next) => {
  let id = req.params.id;
  let user = req.session.user;

  Cart.findOne({ userId: id })
    .populate(`listItems`)
    .exec((err, cartItems) => {
      if (err) return next(err);
      return res.render(`list-cart`, { user, cartItems });
    });
});

// user logout

router.get(`/logout`, (req, res, next) => {
  req.session.destroy();
  res.clearCookie();
  res.redirect(`/`);
});

module.exports = router;
