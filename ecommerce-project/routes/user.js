const { response } = require('express');
var express = require('express');
var router = express.Router();
var producthelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const userhelper = require('../helpers/user-helpers')

const veryfyLogin = (req, res, next) => {
  if (req.session.user.loggedIn) {
    next()
  } else {
    res.redirect("/login")
  }
}


/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userhelper.getCartCount(req.session.user._id)
  }
  producthelper.getAllProducts().then((products) => {
    res.render("user/view-products", { admin: false, products, user, cartCount })
  })
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/")
  } else {
    res.render("user/login", {
      "loginErr":
        req.session.userLoginErr
    })
    req.session.userLoginErr = false
  }
})

router.get("/signup", (req, res) => {
  res.render("user/signup")
})

router.post("/signup", (req, res) => {

  userhelper
    .doSignup(req.body)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  req.session.user = response
  req.session.user.loggedIn = true

  res.redirect("/")

})

router.post("/login", (req, res) => {
  userhelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.user.loggedIn = true

      res.redirect("/")
    } else {
      req.session.userLoginErr = ".Invalid username or password"
      res.redirect("/login")
    }
  })
})


router.get("/logout", (req, res) => {
  req.session.user = null
  res.redirect("/login")

})


router.get("/cart", veryfyLogin, async (req, res) => {
  let products = await userhelper.getCartProducts(req.session.user._id)

  let total = 0
  if (products.length > 0) {
    total = await userHelpers.getTotalAmount(req.session.user._id)
  }
  console.log(products);
  res.render("user/cart", { products, total, 'user': req.session.user._id })
})

router.get("/add-to-cart/:id", veryfyLogin, (req, res) => {
  console.log("api call");
  userhelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})




router.post('/change-product-quantity', (req, res, next) => {
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body)
    .then(async (response) => {
      response.total = await userHelpers.getTotalAmount(req.body.user)
      res.json(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'An error occurred while updating the product quantity.'
      });
    });
});

router.post('/delete-product', (req, res, next) => {
  userHelpers.deleteProduct(req.body)
    .then((response) => {
      res.json(response);
    })
})

router.get("/place-order", veryfyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render("user/place-order", { total, user: req.session.user })
})

router.post('/place-order', async (req, res) => {
  try {
    let products = await userHelpers.getCartProductList(req.body.userId);
    console.log('Cart products:', products);
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    let orderId = await userHelpers.placeOrder(req.body, products, totalPrice);
    console.log('Order ID:', orderId);
    if (req.body['payment-method'] === 'cod') {
      res.json({ codSuccess: true });
    } else {
      console.log('Order ID33:', orderId);
      let response = await userHelpers.generateRazorpay(orderId, totalPrice);
      res.json(response);
    }
  } catch (error) {
    console.log('Error placing order:', error);
    res.json({ status: false, message: 'Error placing order.' });
  }
  console.log(req.body);
});


router.get('/order-success', veryfyLogin, (req, res) => {
  res.render('user/order-success', { user: req.session.user });
});

router.get('/orders', veryfyLogin, async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders', { user: req.session.user, orders })
})

router.get('/view-order-products/:id', veryfyLogin, async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  console.log(products)
  res.render('user/view-order-products', { user: req.session.user, products })
})


router.post('/verify-payment', (req, res) => {

  userHelpers.verifyPayment(req.body).then(() => {
    // Payment is valid, update order status in database
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log('Payment verified and order status updated');
      res.json({ status: true });
    }).catch((err) => {
      console.log('Error updating order status:', err);
      res.json({ status: false });
    });
  })
    .catch(() => {
      // Payment is invalid, do not update order status
      console.log('Invalid payment:', paymentDetails);
      res.json({ status: false });
    });
});


module.exports = router;
