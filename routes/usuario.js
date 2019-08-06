const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/registro", (req,res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req,res) => {
    var erros = []

    //validacao
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null ){
        erros.push({texto: "Email inválido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null ){
        erros.push({texto: "Senha inválida"})
    }
    if(req.body.senha.length <4){
        erros.push({texto: "Senha muito curta"})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas diferentes! Tente novamente"})
    }


    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        //pesquisando por um usuario q tenha email igual ja cadastrado
        Usuario.findOne({email: req.body.email}).then((usuario) => {

            if(usuario){ //se ja existe um usuario
                req.flash("error_msg", "Ja existe uma conta com esse email em nosso sistema")
                res.redirect("/usuarios/registro")
            }else{ //se n existe uma conta, ai sim vamos criar o novo usuario
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: 1
                }) 

                bcrypt.genSalt(10, (erro, salt) => { 
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro para criar o usuario")
                            res.redirect("/")
                        })
                    })
                })
            }

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

    }//fim do else
})

router.get("/login", (req, res) =>{
    res.render("usuarios/login")
})


router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/", //qual caminho q vai redirecionar caso foi um sucesso a autenticacao
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res) => {
    req.logout()
    req.flash("success_msg", "Você foi desconectado com sucesso!")
    res.redirect("/")
})


module.exports = router