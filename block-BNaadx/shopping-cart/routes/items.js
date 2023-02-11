/** @format */

let express = require(`express`);
let router = express.Router();
let Item = require(`../models/Item`);
let User = require(`../models/User`);
let Cart = require(`../models/Cart`);
let Comment = require(`../models/Comment`);
let multer = require(`multer`);
let path = require(`path`);
const fs = require("fs");
let imagePath = path.join(__dirname, `../public/images/`);

// set storage for image

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagePath);
  },
  filename: function (req, file, cb) {
    const fileExtension = Date.now() + `-` + file.originalname;
    cb(null, fileExtension);
  },
});

const upload = multer({ storage: storage });

// find all items

router.get(`/`, (req, res, next) => {
  let user = req.session.user;

  Item.find({}, (err, items) => {
    if (err) return next(err);
    Item.distinct(`category`, (err, uniqueCategory) => {
      if (err) return next(err);
      // console.log(err, uniqueCategory);
      res.render(`list-items`, { user, items, uniqueCategory });
    });
  });
});

// render add item form

router.get(`/add`, (req, res, next) => {
  let user = req.session.user;
  console.log(user);
  let error = req.flash(`error`)[0];
  res.render(`add-item`, { user, error });
});

// add item

router.post(`/add`, upload.single(`image`), (req, res, next) => {
  req.body.image = req.file.filename;
  // console.log(req.body);
  Item.create(req.body, (err, item) => {
    if (err) return next(err);
    req.flash(`error`, `item added successfully`);
    return res.redirect(`/items/add`);
  });
});

//  edit-item

router.get(`/:id/edit`, (req, res, next) => {
  let id = req.params.id;
  let user = req.session.user;
  Item.findById(id, (err, item) => {
    if (err) return next(err);
    console.log(err, item);
    res.render(`edit-item`, { item, user });
  });
});

router.post(`/:id/edit`, upload.single(`image`), (req, res, next) => {
  let id = req.params.id;
  req.body.image = req.file.filename;

  Item.findByIdAndUpdate(id, req.body, { new: true }, (err, item) => {
    console.log(err, item);
    if (err) return next(err);
    return res.redirect(`/items/` + item.id);
  });
});

// delete item

router.get(`/:id/delete`, (req, res, next) => {
  let id = req.params.id;

  Item.findByIdAndDelete(id, (err, item) => {
    if (err) return next(err);
    Comment.deleteMany({ itemId: id }, (err, comment) => {
      if (err) return next(err);
      let filePath = imagePath + `${item.image}`;
      fs.unlink(filePath, err => {
        if (err) return next(err);
        res.redirect(`/items`);
      });
    });
  });
});

// like and dislike item

router.get(`/:id/likes`, (req, res, next) => {
  let id = req.params.id;
  Item.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true },
    (err, item) => {
      res.redirect(`/items/` + id);
    }
  );
});

router.get(`/:id/dislikes`, (req, res, next) => {
  let id = req.params.id;

  Item.findByIdAndUpdate(
    id,
    { $inc: { dislikes: 1 } },
    { new: true },
    (err, item) => {
      if (err) return next(err);
      res.redirect(`/items/` + id);
    }
  );
});
// filter by category

router.get(`/:category/filter`, (req, res, next) => {
  let ctg = req.params.category;
  let user = req.session.user;
  Item.find({ category: ctg }, (err, items) => {
    if (err) return next(err);

    Item.distinct(`category`, (err, uniqueCategory) => {
      if (err) return next(err);
      return res.render(`list-items`, { user, items, uniqueCategory });
    });
  });
});

// add item into cart

router.get(`/:id/cart`, (req, res, next) => {
  let itemId = req.params.id;
  let userId = req.session.userId;
  Cart.findOne({ userId }, (err, cart) => {
    if (err) return next(err);
    if (cart === null) {
      req.body.userId = userId;
      req.body.listItems = [itemId];
      Cart.create(req.body, (err, data) => {
        if (err) return next(err);
        // console.log(err, data);
        req.flash(`error`, `item added `);
        return res.redirect(`/items/` + itemId);
      });
    } else {
      if (cart.listItems.includes(itemId)) {
        req.flash(`error`, `item already added in cart`);
        return res.redirect(`/items/` + itemId);
      } else {
        Cart.findOneAndUpdate(
          { userId },
          { $push: { listItems: itemId } },
          { new: true },
          (err, data) => {
            if (err) return next(err);
            console.log(err, data, `added`);
            req.flash(`error`, `item added`);
            return res.redirect(`/items/` + itemId);
          }
        );
      }
    }
    // console.log(err, cartItem, `cart`);
  });
});

// remove item  from cart
router.get(`/:id/remove`, (req, res, next) => {
  let id = req.params.id;
  Cart.findOneAndUpdate(
    { listItems: id },
    { $pull: { listItems: id } },
    { new: true },
    (err, cart) => {
      console.log(err, cart);
      return res.redirect(`/users/${cart.userId}/list-cart`);
    }
  );
});

// comments

router.post(`/:id/comment`, (req, res, next) => {
  let id = req.params.id;
  req.body.itemId = id;
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);
    Item.findByIdAndUpdate(
      id,
      { $push: { comments: comment.id } },
      { new: true },
      (err, item) => {
        if (err) return next(err);
        return res.redirect(`/items/` + id);
        // console.log(err, item, `iii`);
      }
    );
  });
});

// increase and decrease cart item quantity

router.get(`/:id/incQuant`, (req, res, next) => {
  let id = req.params.id;
  Cart.findOneAndUpdate(
    { listItems: id },
    { $inc: { itemQuantity: 1 } },
    { new: true },
    (err, cart) => {
      if (err) return next(err);
      console.log(err, cart);
      return res.redirect(`/users/${cart.userId}/list-cart`);
    }
  );
});

router.get(`/:id/decQuant`, (req, res, next) => {
  let id = req.params.id;
  Cart.findOneAndUpdate(
    { listItems: id },
    { $inc: { itemQuantity: -1 } },
    { new: true },
    (err, cart) => {
      if (err) return next(err);
      console.log(err, cart);
      return res.redirect(`/users/${cart.userId}/list-cart`);
    }
  );
});

// find single item

router.get(`/:id`, (req, res, next) => {
  let id = req.params.id;
  let user = req.session.user;

  Item.findById(id)
    .populate(`comments`)
    .exec((err, item) => {
      // console.log(err, item, `pop`);

      if (err) return next(err);
      let error = req.flash(`error`)[0];

      return res.render(`single-item`, { item, user, error });
    });

  // Item.findById(id, (err, item) => {
  //   if (err) return next(err);
  //   let error = req.flash(`error`)[0];
  //   return res.render(`single-item`, { item, user, error });
  // });
});

module.exports = router;
