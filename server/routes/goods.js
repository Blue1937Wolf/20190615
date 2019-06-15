var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

//连接MongoDB数据库
mongoose.connect('mongodb://localhost/du_mall', { useNewUrlParser: true });

mongoose.connection.on('connected', () => {
  console.log("mongodb connected success");
});

mongoose.connection.on('error', () => {
  console.log("mongodb connected error");
});

mongoose.connection.on('disconnected', () => {
  console.log("mongodb connected disconnect");
});

//查询商品列表数据
router.get('/', (req, res, next) => {
  let page = parseInt(req.param('page'));
  let pageSize = parseInt(req.param('pageSize'));
  let priceLevel = req.param('priceLevel');
  let sort = req.param('sort');
  let skip = (page - 1) * pageSize;

  let params = {};
  let priceGt = '';
  let priceLte = '';
  if (priceLevel != 'all') {
    switch (priceLevel) {
      case '0': priceGt = 0; priceLte = 500; break;
      case '1': priceGt = 500; priceLte = 1000; break;
      case '2': priceGt = 1000; priceLte = 2000; break;
      case '3': priceGt = 2000; priceLte = 4000; break;
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    };
  }

  Goods.find(params).skip(skip).limit(pageSize).sort({ 'salePrice': sort }).exec((error, doc) => {
    if (error) {
      res.json({
        status: "1",
        msg: error.message
      })
    } else {
      res.json({
        status: "0",
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }
      })
    }
  });
});

//加入到购物车
router.post("/addCart", function (req, res, next) {
  var userId = '100000077', productId = req.body.productId;
  var User = require('../models/user');
  User.findOne({userId:userId}, function (err,userDoc) {
    if(err){
        res.json({
            status:"1",
            msg:err.message
        })
    }else{
        //console.log("userDoc:"+userDoc);
        if(userDoc){
          var goodsItem = '';
          userDoc.cartList.forEach(function (item) {
              if(item.productId == productId){
                goodsItem = item;
                item.productNum ++;
              }
          });
          if(goodsItem){
            userDoc.save(function (err2,doc2) {
              if(err2){
                res.json({
                  status:"1",
                  msg:err2.message
                })
              }else{
                res.json({
                  status:'0',
                  msg:'',
                  result:'suc'
                })
              }
            })
          }else{
            Goods.findOne({productId:productId}, function (err1,doc) {
              if(err1){
                res.json({
                  status:"1",
                  msg:err1.message
                })
              }else{
                if(doc){
                  doc.productNum = 1;
                  doc.checked = 1;
                  userDoc.cartList.push(doc);
                  userDoc.save(function (err2,doc2) {
                    if(err2){
                      res.json({
                        status:"1",
                        msg:err2.message
                      })
                    }else{
                      res.json({
                        status:'0',
                        msg:'',
                        result:'suc'
                      })
                    }
                  })
                }
              }
            });
          }
        }
    }
  })
});

module.exports = router;