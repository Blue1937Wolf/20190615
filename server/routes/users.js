var express = require('express');
var router = express.Router();
var User = require('../models/user');
require('../util/util');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//登录
router.post('/login', (req, res, next) => {
  // console.log("login");
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  };

  User.findOne(param, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: res.message
      })
    } else {
      if (doc) {
        res.cookie('userId', doc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        res.cookie('userName', doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        });
      }
    }
  });
});

//登出
router.post('/logout', function (req, res, next) {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  });
  res.json({
    status: '0',
    msg: '',
    result: ''
  });
});

//检查是否登录
router.get('/checkLogin', function (req, res, next) {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName
    })
  } else {
    res.json({
      status: '1',
      msg: '未登录',
      result: ''
    })
  }
});

//查询购物车列表
router.get('/cartList', function (req, res, next) {
  let userId = req.cookies.userId
  if (userId) {
    User.findOne({ userId: userId }, (err, doc) => {
      if (err) {
        res.json({
          status: '1',
          msg: res.message,
          result: ''
        });
      } else {
        if (doc) {
          res.json({
            status: '0',
            msg: '',
            result: doc.cartList
          });
        }
      }
    });
  }
});

//删除商品
router.post('/cartDel', function (req, res, next) {
  let productId = req.body.productId;
  let userId = req.cookies.userId;

  User.update({ 'userId': userId }, { $pull: { 'cartList': { 'productId': productId } } }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: res.message,
        result: ''
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc
        });
      }
    }
  });
});

//编辑商品数量
router.post('/editCart', function (req, res, next) {
  let productId = req.body.productId;
  let productNum = req.body.productNum;
  let checked = req.body.checked;
  let userId = req.cookies.userId;

  User.updateOne({ 'userId': userId, 'cartList.productId': productId },
    { 'cartList.$.productNum': productNum, 'cartList.$.checked': checked }, (err, doc) => {
      if (err) {
        res.json({
          status: '1',
          msg: res.message,
          result: ''
        });
      } else {
        if (doc) {
          res.json({
            status: '0',
            msg: '',
            result: doc
          });
        }
      }
    });
})

//商品全选
router.post('/checkAll', function (req, res, next) {
  let checkAll = req.body.checkAll ? 1 : 0;
  let userId = req.cookies.userId;

  User.findOne({ 'userId': userId }, (err, user) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (user) {
        user.cartList.forEach((item) => {
          item.checked = checkAll;
        })
        user.save((err1, doc) => {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            });
          } else {
            if (doc) {
              res.json({
                status: '0',
                msg: '',
                result: doc
              });
            }
          }
        })
      }
    }
  })
});

//查询地址列表
router.get('/addressList', function (req, res, next) {
  let userId = req.cookies.userId;

  User.findOne({ 'userId': userId }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err1.message,
        result: ''
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.addressList
        });
      }
    }
  })
});

//修改默认地址
router.post('/setDefault', function (req, res, next) {
  let userId = req.cookies.userId,
    addressId = req.body.addressId;

  if (!addressId) {
    res.json({
      status: '1004',
      msg: 'addressId 为空',
      result: ''
    })
  } else {
    User.findOne({ 'userId': userId }).then((doc) => {
      doc.addressList.forEach((item) => {
        if (item.addressId == addressId) {
          item.isDefault = true;
        } else {
          item.isDefault = false;
        }
      })
      return doc.save();
    }).then((doc) => {
      res.json({
        status: '0',
        msg: '',
        result: doc
      })
    }).catch((err) => {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    });
  }
});

//删除地址
router.post('/deleteAddr', function (req, res, next) {
  let userId = req.cookies.userId,
    addressId = req.body.addressId;

  if (!addressId) {
    res.json({
      status: '1005',
      msg: 'addressId 为空',
      result: ''
    })
  } else {
    User.update({ 'userId': userId }, {
      $pull: {
        'addressList': {
          'addressId': addressId
        }
      }
    }).then((doc) => {
      res.json({
        status: '0',
        msg: '',
        result: doc
      })
    }).catch((err) => {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    });
  }
});

//提交订单
router.post('/payMent', function (req, res, next) {
  let userId = req.cookies.userId,
    addressId = req.body.addressId,
    orderTotal = req.body.orderTotal,
    orderInfo = {};

  // console.log(orderTotal);
  User.findOne({ 'userId': userId }).then((doc) => {
    let address = {}, goodsList = [];

    doc.addressList.filter((item) => {
      if (item.addressId == addressId) {
        address = item;
      }
    });

    doc.cartList.filter((item) => {
      if (item.checked == '1') {
        goodsList.push(item);
      }
    });

    let r1 = Math.floor(Math.random() * 10);
    let r2 = Math.floor(Math.random() * 10);
    let sysDate = new Date().Format('yyyyMMddhhmmss');
    let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');

    let platform = 766;
    let orderId = platform + r1 + sysDate + r2;

    orderInfo = {
      orderId: orderId,
      orderTotal: orderTotal,
      goodsList: goodsList,
      addressInfo: address,
      orderStatus: '1',
      createDate: createDate
    }

    doc.orderList.push(orderInfo);
    return doc.save();
  }).then((doc) => {
    res.json({
      status: '0',
      msg: '',
      result: {
        orderId: orderInfo.orderId,
        orderTotal: orderInfo.orderTotal
      }
    })
  }).catch((err) => {
    res.json({
      status: '1',
      msg: err.message,
      result: ''
    })
  })
});

//根据订单id获取订单总金额
router.get('/orderDetail', function (req, res, next) {
  let userId = req.cookies.userId,
    orderId = req.param('orderId');

  User.findOne({ 'userId': userId }).
    then((doc) => {
      let orderTotal = 0;
      doc.orderList.filter((item) => {
        if (item.orderId == orderId) {
          orderTotal = item.orderTotal;
          // console.log(orderTotal);
        }
      })

      if (orderTotal > 0) {
        res.json({
          status: '0',
          msg: '',
          result: {
            orderTotal: orderTotal
          }
        })
      } else {
        res.json({
          status: '1006',
          msg: '无此订单',
          result: ''
        })
      }

    }).catch((err) => {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    })
});

//查询购物车商品数量
router.get('/getCartCount', function (req, res, next) {
  let userId = req.cookies.userId;

  User.findOne({ 'userId': userId }).then((doc) => {
    let cartCount = 0;
    doc.cartList.map((item) => {
      cartCount += item.productNum;
    })

    res.json({
      status: '0',
      msg: '',
      result: {
        cartCount
      }
    })
  }).catch((err) => {
    res.json({
      status: '1',
      msg: err.message,
      result: ''
    })
  });

});
module.exports = router;
