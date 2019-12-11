var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/' ,function (req, res, next) {
  console.log(req.body.data);
  res.status(200).json({message: 'you are connected'});
});
module.exports = router;
