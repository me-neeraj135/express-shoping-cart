/** @format */

let express = require(`express`);
const { rawListeners } = require("../models/Item");

let router = express.Router();
let User = require(`../models/User`);
let Item = require(`../models/Item`);

router.get(`/signup`, (req, res, next) => {
  let error = req.flash(`error`)[0];
  let session = req.session.userId;
  console.log(session, `ssssss`);
  res.render(`sign-up`, { error, session });
});

router.post(`/signup`, (req, res, next) => {
  const user = { ...req.body };
  if (req.body.isAdmin === `on`) {
    user.isAdmin = true;
  } else {
    user.isAdmin = false;
  }
  User.create(user, (err, user) => {
    if (err) {
      if ((err.name = `ValidationError`)) {
        req.flash(`error`, err.message);
        return res.redirect(`/admin/signup`);
      }
    }
    return res.redirect(`/users/login`);
  });
});

// find admin

router.get(`/:id`, (req, res, next) => {
  let id = req.params.id;

  User.findById(id, (err, user) => {
    if (err) return next(err);
    Item.find({}, (err, items) => {
      if (err) return next(err);
      res.render(`admin-dashboard`, { user, items });
    });
  });
});

module.exports = router;
