const express = require("express")
const router = express.Router()
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const {eadmin} = require("../helpers/eadmin")

  router.get('/', eadmin,(req, res) => {
    res.render("admin/index")
  })

  router.get('/posts', eadmin, (req, res) => {
    res.send("Página de posts")
  })

  router.get('/categorias', eadmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
      res.render("admin/categorias", {categorias: categorias}) //passar categorias para a pgn
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias")
      res.redirect("/admin")
    }) //todo model tem a funcao find

  })

  router.get('/categorias/add', eadmin, (req, res) => {
    res.render("admin/addcategorias")
  })

  router.post('/categorias/nova', eadmin, (req, res) => {
    //validação de formulario
    var erros = []
    if(!req.body.nome  || typeof  req.body.nome == null || req.body.nome == undefined){
      erros.push({texto: "Nome inválido"}) //colocar um novo dado no array
    }if(!req.body.slug  || typeof  req.body.slug == null || req.body.slug == undefined){ //se n for enviado nome (faz referencia ao html da pagina)
      erros.push({texto: "Slug inválido"}) //colocar um novo dado no array
    }
    if(req.body.nome.length < 5){
      erros.push({texto: "Nome muito curto"})
    }
    if(erros.length > 0){
      res.render("admin/addcategorias", {erros: erros})
    }else{
      const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug //fazem referencia ao nome das views
      }

      new Categoria(novaCategoria).save().then(() => {
        req.flash("success_msg", "Categoria criada com sucesso")
        res.redirect("/admin/categorias")
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a categoria!")
        res.redirect("/admin/")
      })
    }

  })

router.get("/categorias/edit/:id", eadmin, (req, res) => {
  Categoria.findOne({_id:req.params.id}).then((categoria) => {//procure o registro q seja igual
    res.render("admin/editcategorias", {categoria: categoria})
  }).catch((err) => {
    req.flash("error_msg", "Esta categoria não existe")
    res.redirect("/admin/categorias")
  })
})

router.post("/categorias/edit", eadmin, (req, res) => {
  //validação de formulario
  var erros = []
  if(!req.body.nome  || typeof  req.body.nome == null || req.body.nome == undefined){
    erros.push({texto: "Nome inválido"}) //colocar um novo dado no array
    req.flash("error_msg", "Campo nome inválido")
  }if(!req.body.slug  || typeof  req.body.slug == null || req.body.slug == undefined){ //se n for enviado nome (faz referencia ao html da pagina)
    erros.push({texto: "Slug inválido"}) //colocar um novo dado no array
    req.flash("error_msg", "Campo slug inválido   ")
  }
  if(req.body.nome.length > 0 && req.body.nome.length < 5 ){
    erros.push({texto: "Nome muito curto"})
    req.flash("error_msg", "Nome de categoria muito curto")
  }
  if(erros.length > 0){
    res.redirect("/admin/categorias/edit/"+req.body.id)
  }else{

    Categoria.findOne({_id: req.body.id}).then((categoria) => {
      categoria.nome = req.body.nome
      categoria.slug = req.body.nome //campo slug da categoria q vamos editar receber o q ta no formulario

        categoria.save().then(() => {

        req.flash("success_msg", "Categoria editada com sucesso!!")
        res.redirect("/admin/categorias")
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edicao da categoria")
        res.redirect("/admin/categorias")
      })

    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria")
      res.redirect("/admin/categorias")
    }) //pesquisar categoria q tem id igual a req body id

  }//fim do else

})

router.post("/categorias/deletar", eadmin, (req, res) => {
  Categoria.remove({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Categoria deletada com sucesso")
    res.redirect("/admin/categorias")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar a categoria")
    res.redirect("/admin/categorias")
  })
})

router.get("/postagens", eadmin, (req,res) => {
  Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
      res.render("admin/postagens", {postagens: postagens})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as postagens")
    res.redirect("/admin")
  })

})

router.get("/postagens/add", eadmin, (req, res) => {
  Categoria.find().then((categorias) => {
      res.render("admin/addpostagem", {categorias: categorias}) //renderiz aa pagina de edicao de postagens
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao recarregar o formulario")
    res.redirect("/admin")
  })
})

router.post("/postagens/nova", eadmin, (req,res) => {
  var erros = []
  if(req.body.categoria == 0){
    erros.push({texto: "Categoria inválida, registre uma categoria"})
  }
  if(erros.length > 0){
    res.render("admin/addpostagem", {erros: erros})
  }else{
    const novaPostagem  = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }

    new Postagem(novaPostagem).save().then(() => {
      req.flash("success_msg", "Postagem criada com sucesso!")
      res.redirect("/admin/postagens")
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
      res.redirect("/admin/postagens")
    })

  }
})

router.get("/postagens/edit/:id", eadmin, (req, res) => {
  Postagem.findOne({_id:req.params.id}).then((postagem) => {//procure o registro q seja igual
    Categoria.find().then((categorias) => {
      res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias")
      res.redirect("/admin/postagens")
    })

  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulario de edicao")
    res.redirect("/admin/postagens")
  })
})

router.post("/postagens/edit", eadmin, (req, res) => {
  //validação de formulario
  var erros = []

  if(erros.length > 0){
    res.redirect("/admin/postagens/edit/"+req.body.id)
  }else{

    Postagem.findOne({_id: req.body.id}).then((postagem) => { //pesquisando por uma postagem q tenha id igual o q estamos passando
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
          req.flash("success_msg", "Postagem editada com sucesso")
          res.redirect("/admin/postagens")
        }).catch((err) => {
          req.flash("error_msg", "Erro interno para editar a postagem")
          res.redirect("/admin/postagens")
        })
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a edição.")
      res.redirect("/admin/postagens")
    })

  }//fim do else
})

router.post("/postagens/deletar", eadmin, (req, res) => {
  Postagem.remove({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Postagem deletada com sucesso")
    res.redirect("/admin/postagens")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar a postagem")
    res.redirect("/admin/categorias")
  })
})

router.get("/listagem", eadmin, (req, res) => {
  Usuario.find().populate("usuarios").sort("desc").then((usuarios) => {
    res.render("admin/listagem", {usuarios: usuarios})
  }).catch((err) => {

  })
})

router.post("/listagem/deletar", eadmin, (req, res) => {
  Usuario.remove({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Usuario deletada com sucesso")
    res.redirect("/admin/listagem")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar a categoria")
  })
})

router.post("/listagem/administrador", eadmin, (req, res) => {
  Usuario.findOne({_id: req.body.id}).then((usuario) => {
    usuario.eAdmin = 1
    
    usuario.save().then(() => {
      req.flash("success_msg", "Usuario editada com sucesso!!")
      res.redirect("/admin/listagem")
    }).catch((err) => {
      req.flash("errors_msg", "Houve um erro ao editar o usuario")
      res.redirect("/admin/listagem")
    })
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ")
  })
})

router.post("/listagem/usuario", eadmin, (req, res) => {
  Usuario.findOne({_id: req.body.id}).then((usuario) => {
    usuario.eAdmin = 0
    
    usuario.save().then(() => {
      req.flash("success_msg", "Usuario editada com sucesso!!")
      res.redirect("/admin/listagem")
    }).catch((err) => {
      req.flash("errors_msg", "Houve um erro ao editar o usuario")
      res.redirect("/admin/listagem")
    })
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ")
  })
})



module.exports = router
