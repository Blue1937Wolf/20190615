var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    "userId": String,
    "userName": String,
    "userPwd": String,
    "orderList": [
        {
            "orderId": Number,
            "orderTotal": String,
            "goodsList": [
                {
                    "productId": String,
                    "productName": String,
                    "productImage": String,
                    "salePrice": String,
                    "productNum": Number,
                    "checked": Number
                }
            ],
            "addressInfo": [
                {
                    "addressId": String,
                    "userName": String,
                    "streetName": String,
                    "postCode": Number,
                    "tel": Number,
                    "isDefault": Boolean
                }
            ],
            "orderStatus": String,
            "createDate": Date
        }
    ],
    "cartList": [
        {
            "productId": String,
            "productName": String,
            "productImage": String,
            "salePrice": String,
            "productNum": Number,
            "checked": Number
        }
    ],
    "addressList": [
        {
            "addressId": String,
            "userName": String,
            "streetName": String,
            "postCode": Number,
            "tel": Number,
            "isDefault": Boolean
        }
    ]
});

module.exports = mongoose.model("User", userSchema);