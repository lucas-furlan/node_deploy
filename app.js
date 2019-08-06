//carregando modulo
  const express = require('express')
  const handlebars = require('express-handlebars')
  const bodyParser = require('body-parser')
  const app = express() //recebe a func que vem do express
  const admin = require('./routes/admin') //pegando o arquivo admin dentro da pasta routes e colocando ele na constante admin
  const path = require("path") //serve para manipular pastas
  const mongoose = require("mongoose")
  const session = require("express-session")
  const flash = require("connect-flash")
  require("./models/Postagem")
  const Postagem = mongoose.model("postagens")
  require("./models/Categoria")
  const Categoria = mongoose.model("categorias")
  const usuarios = require("./routes/usuario")
  const passport = require("passport")
  require("./config/auth")(passport)
  const db = require("./config/db")

  //importar variaveis locais
  require('dotenv').config({ path: 'variaveis.env'});
  

//configuracoes

  //sessao
    app.use(session({
      secret: "node",
      resave: true,
      saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
  //midlware
    app.use((req, res, next) => {
      //variaveis globais
      res.locals.success_msg = req.flash("success_msg")
      res.locals.error_msg = req.flash("error_msg")
      res.locals.error = req.flash("error")
      res.locals.user = req.user || null; //armazena dados de usuario autenticado
      next()
    })
  //mongoose
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true 
  }).then(() => {
    console.log("Conetado com sucesso")
  }).catch((err) => {
    console.log("Erro ao se conectar! "+ err)
  })

  //body-parser
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())

  //handlebars
  app.engine('handlebars', handlebars({defaultLayout: 'main'}))
  app.set('view engine', 'handlebars')

  //Public
  app.use(express.static(path.join(__dirname, "public"))) //falando pro express q a pasta q ta guardando os arquiv esatisc e a public

  app.use((req, res, next) => {
    console.log("Oi eu sou o middleware")
    next();
  })
  //path.join(__dirname, "public") == pega o diretorio absoluto para evitar erros

//rotas
  app.get('/', (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
      res.render("index", {postagens: postagens})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno!")
      res.redirect("/404")
    })

  })

  app.get("/postagem/:slug", (req,res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
      if(postagem){
        res.render("postagem/index", {postagem: postagem})
      }else{
        req.flash("error_msg", "Está postagem não existe!")
        res.redirect("/")
      }//fim do else
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro internoooo")
      res.redirect("/")
    })
  })

  app.get("/categorias", (req,res) => {
    Categoria.find().then((categorias) => {
      res.render("categorias/index", {categorias: categorias})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias")
      res.redirect("/")
    })
  })

  app.get("/categorias/:slug", (req,res) => {

    Categoria.findOne({slug: req.params.slug}).then((categoria) => {

          if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens) => {
              res.render("categorias/postagens", {postagens: postagens, categorias: categoria})
            }).catch((err) => {
              req.flash("error_msg", "Houve um erro ao listar os posts")
              res.redirect("/")
            })
          }else{
            req.flash("error_msg", "Essa categoria nao existe")
            res.redirect("/")
          }

    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao carregar a pagina desta categoria")
      res.redirect("/")
    })

  })//fim da rota

  app.get('/404', (req,res) => {
    res.send("error 404")
  })


  app.use('/admin', admin) //define prefixo da URL da rota, referencia a const admin
  app.use("/usuarios", usuarios)





 //Outros 
 const HOST = process.env.HOST  || '0.0.0.0';
 const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
  console.log("servidor está online!")
})
