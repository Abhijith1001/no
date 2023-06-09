var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('../app')
var objectId = require("mongodb").ObjectId
const Razorpay = require('razorpay');
const instance = new Razorpay({
  key_id: 'rzp_test_BSQUeNGcW3SxXt',
  key_secret: 'qlmrZ5aQeuObUu3xRUczaDzP'
});

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10)
      db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
        resolve(data)
      })


    })


  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginstatus = false
      let response = {}
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user
            response.status = true
            resolve(response)
          } else {
            console.log("login failed");
            resolve({ status: false })
          }
        })
      } else {
        console.log("user not found");
        resolve({ status: false })
      }
    })
  },

  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (userCart) {
        let proExist = userCart.products.findIndex(product => product.item == proId)
        if (proExist != -1) {
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
              {
                $inc: { 'products.$.quantity': 1 }
              }).then(() => {
                resolve()
              })
        }
        else {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
            {

              $push: { products: proObj }

            }).then((response) => {
              resolve()
            })
        }
      } else {
        let cartobj = {
          user: objectId(userId),
          products: [
            proObj
          ]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartobj).then((response) => {
          resolve()
        })
      }
    })
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {

          $match: { user: objectId(userId) }

        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'

          }
        }, {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }

      ]).toArray()
      resolve(cartItems)
    })
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (cart) {
        count = cart.products.length
      } resolve(count)
    })
  },

  changeProductQuantity(details) {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({
            _id: objectId(details.cart)
          }, {
            $pull: {
              products: {
                item: objectId(details.product)
              }
            }
          })
          .then((response) => {
            resolve({
              removeProduct: true
            });
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({
            _id: objectId(details.cart),
            'products.item': objectId(details.product)
          }, {
            $inc: {
              'products.$.quantity': details.count
            }
          })
          .then((response) => {
            resolve({
              quantity: details.quantity + details.count
            });
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },

  deleteProduct(details) {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CART_COLLECTION)
        .updateOne({
          _id: objectId(details.cart)
        }, {
          $pull: {
            products: {
              item: objectId(details.product)
            }
          }
        })
        .then((response) => {
          resolve({
            removeProduct: true
          });
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {

          $match: { user: objectId(userId) }

        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'

          }
        }, {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                  { $toDouble: '$quantity' },
                  { $toDouble: '$product.productPrice' }
                ]
              }
            }
          }
        }

      ]).toArray()

      resolve(total && total.length > 0 && total[0].total || 0)

    })
  },

  placeOrder: (order, products, total) => {
    return new Promise(async (resolve, reject) => {
      console.log('Order:', order);
      console.log('Products:', products);
      console.log('Total:', total);

      // add code to place the order here
      let status = order['payment-method'] === 'cod' ? 'placed' : 'pending';

      let orderObj = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode
        },
        userId: objectId(order.userId),
        paymentMethod: order['payment-method'],
        products: products,
        totalAmount: total,
        status: status,
        date: new Date()
      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
        db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
        resolve(response.insertedId)
      })


    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });

      resolve(cart.products);
    });
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) }).toArray()
      resolve(orders)
    })
  },
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let oderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { _id: objectId(orderId) }
        },

        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'

          }
        }, {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        },

      ]).toArray()
      resolve(oderItems)
    })
  },
  generateRazorpay: (orderId, totalPrice) => {
    const options = {
      amount: totalPrice*100,
      currency: 'INR',
      receipt: "" + orderId
    };
    return new Promise((resolve, reject) => {
      instance.orders.create(options, (err, order) => {
        if (err) {
          console.log('Error creating order:', err);
          reject(err);
        } else {
          console.log('Order created:', order);
          resolve(order);
        }
      });
    });
  },
  verifyPayment:(details) => {
    return new Promise((resolve, reject) => {
      const crypto = require('crypto');
      let hmac = crypto.createHmac('sha256', 'qlmrZ5aQeuObUu3xRUczaDzP')
      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      hmac=hmac.digest('hex')
      if(hmac===details['payment[razorpay_signature]']){
        resolve()
      }else{
        reject()
      }
    });
  },
  changePaymentStatus:(orderId)=>{
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
      {
        $set:{
          status:'placed'
        }
      }).then(()=>{
        resolve()
      })
    })
  }





}