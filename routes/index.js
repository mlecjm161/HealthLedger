var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
 return res.render('index');
});

router.get('/api/viewEhr', function(req, res){
  return res.render('queryEhr');
});
module.exports = router;
