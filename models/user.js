var mongoose = require('mongoose')
mongoose.Promise = global.Promise
var Schema = mongoose.Schema

var userSchema = new Schema({
  name: { type: String, default: 'Guest' },
  id: { type: String, required: true, unique: true },
  fridge: { type: Array, default: [] },
  cookingToday: { type: Array, default: [] },
  shoppingCart: { type: Array, default: [] }
})

userSchema.methods.addToFridge = function (ingredient, cb) {
  const query = { id: this.id, 'fridge.id': { '$ne': ingredient.id } }
  const update = { '$push': { 'fridge': ingredient } }
  this.constructor.update(query, update, cb)
}

userSchema.methods.delFromFridge = function (ingredient, cb) {
  const query = { id: this.id }
  const update = { '$pull': { fridge: { id: ingredient.id } } }
  this.constructor.update(query, update, cb)
}

var User = mongoose.model('User', userSchema)

module.exports = User