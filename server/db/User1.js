const mongoose = require('mongoose')

const userSchema1 = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
;
module.exports = mongoose.model("users1", userSchema1)