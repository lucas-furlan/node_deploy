const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Categoria = new Schema({
  nome: {
    type: String,
    require: true
  },
  slug: {
    type: String,
    require: true
  },
  date: {
    type: Date,
    default: Date.now() //na hora q o usuario cadastrar ficara registrado data exada do registro, now = agora
  }
})

mongoose.model("categorias", Categoria)
