var db = require('../config/connection')
var collection = require('../config/collections');
var objectId = require("mongodb").ObjectId
const bcrypt = require('bcrypt');
module.exports = {




    addProduct: (product, callback) => {
        db.get().collection('product').insertOne(product, (err, result) => {
            if (err) {
                console.log(err);
                return callback(err, null);
            }
            console.log(result.insertedId);
            return callback(null, result.insertedId);
        });
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(proId) }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },

    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {

                        productName: proDetails.productName,
                        productDescription: proDetails.productDescription,
                        productPrice: proDetails.productPrice,
                        productCategory: proDetails.productCategory
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    
}


