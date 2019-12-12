var express = require('express');
var router = express.Router();

/* test options */
router.get('/' , function (req, res, next) {
  var date = new Date();
  var timestamp = date.getTime();
  console.log(typeof timestamp.toString(),timestamp.toString());
  return res.send({time: timestamp.toString()});
});
module.exports = router;
