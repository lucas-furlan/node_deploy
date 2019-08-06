 const mongoose = require('mongoose')
 const Schema = mongoose.Schema;

 const Postagem = new Schema({

   titulo:{
     type: String,
     required: true
   },
   slug:{
     type: String,
     required: true
   },
   descricao:{
     type: String,
     required: true
   },
   conteudo:{
     type: String,
     required: true
   },
   categoria:{ //aqui iremos armazenr o id de uma categoria (relacionamento entre 2 documentos)
    type: Schema.Types.ObjectId, //significa q a categoria vai armazer o id de algum objeto
    ref:"categorias",  //nome que deu ao model que sera usada de referencia
    required: true
  },
   data:{
     type: Date,
     default: Date.now()
   }
 })

 mongoose.model("postagens", Postagem) //collection do model
