const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  isCustomer: Boolean,
  lastname: String,
  mail: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: String,
  date: {type: Date, default:Date.now}
})

userSchema.methods.generateJWT = function(){
  return jwt.sign({
    _id: this._id, 
    name: this.name,
    role: this.role,
  }, process.env.SECRET_KEY_JWT_CAR_API)
}

const User = mongoose.model('user', userSchema)
module.exports = User