var express = require('express');
const { response } = require('../app');
var router = express.Router();

// var db = require('../config/connection')
// var collection = require('../config/collections')
// const bcrypt = require('bcrypt')
// var objectId = require("mongodb").ObjectId


var producthelper = require('../helpers/product-helpers')

// const saltRounds = 10;

// // Replace with your desired admin email and plain password
// const plainPassword = 'adminPassword123';
// const adminEmail = 'admin@example.com';

// bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
//   if (err) throw err;

//   const admin = {
//     email: adminEmail,
//     password: hash
//   };
  
//   db.get().collection(collection.ADMIN_COLLECTION).insertOne(admin, function(err, result) {
//     if (err) throw err;
    
//     console.log('Admin created:', result.insertdId);
//   });
// });

// // Then in your login code
// const verifyLogin = (req, res, next) => {
//   if (req.session.admin && req.session.admin.loggedIn) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// };

// router.get("/login", (req, res) => {
//   if (req.session.admin && req.session.admin.loggedIn) {
//     res.redirect("/");
//   } else {
//     res.render("admin/login", {
//       loginErr: req.session.adminLoginErr,
//     });
//     req.session.adminLoginErr = false;
//   }
// });

// router.post("/login", (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: email }, function(err, admin) {
//     if (err) throw err;

//     if (admin) {
//       bcrypt.compare(password, admin.password, function(err, result) {
//         if (err) throw err;

//         if (result) {
//           req.session.admin = {
//             email: email,
//             loggedIn: true
//           };
//           res.redirect("/");
//         } else {
//           req.session.adminLoginErr = "Invalid password";
//           res.redirect("/login");
//         }
//       });
//     } else {
//       req.session.adminLoginErr = "Invalid email";
//       res.redirect("/login");
//     }
//   });
// });
 router.get("/",  function (req, res, next) {
  producthelper.getAllProducts().then((products) => {
     res.render("admin/view-product", { admin: true, products });
   });
 });

router.get("/add-product",(req, res) => {
  res.render("admin/add-product")
})

router.post("/add-product", (req, res) => {

  producthelper.addProduct(req.body, (err, id) => {
    if (err) {
      console.log(err);
      return;
    }
    let image = req.files.productImage
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect("/admin")
      }
    });
  });



})

router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id
  console.log(proId);
  producthelper.deleteProduct(proId).then((response) => {
    res.redirect("/admin/")
  })
})


router.get("/edit-product/:id", async (req, res) => {
  let product = await producthelper.getProductDetails(req.params.id)
  console.log(product);
  res.render("admin/edit-product", { product })
})

router.post("/edit-product/:id", (req, res) => {
  producthelper.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin")
    if (req.files.productImage) {
      let image = req.files.productImage
      image.mv('./public/product-images/' + req.params.id + '.jpg');
    }
  })
})

module.exports = router;
