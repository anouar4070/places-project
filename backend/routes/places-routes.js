const express = require('express')

const router = express.Router();

router.get('/', (req, res, next) => {
  console.log('Get Req in Places')
  res.json({message: 'it works!'})
})

module.exports = router;