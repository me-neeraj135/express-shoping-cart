/** @format */

let express = require(`express`);
const { rawListeners } = require("../models/Comment");
let router = express.Router();
let Comment = require(`../models/Comment`);
let Item = require(`../models/Item`);

// update comment

router.get(`/:id/edit`, (req, res, next) => {
  let id = req.params.id;
  let user = req.session.user;
  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    return res.render(`comment-edit-form`, { user, comment });
  });
});

router.post(`/:id/edit`, (req, res, next) => {
  let id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body, { new: true }, (err, comment) => {
    if (err) return next(err);

    return res.redirect(`/items/` + comment.itemId);
  });
});
// delete comment

router.get(`/:id/delete`, (req, res, next) => {
  let id = req.params.id;
  Comment.findByIdAndDelete(id, (err, comment) => {
    if (err) return next(err);
    Item.findByIdAndUpdate(
      comment.itemId,
      { $pull: { comments: id } },
      { new: true },
      (err, item) => {
        if (err) return next(err);
        return res.redirect(`/items/` + item.id);
      }
    );
  });
});
module.exports = router;
