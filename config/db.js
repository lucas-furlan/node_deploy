if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb://lucas:123abc@blog-hydhs.mongodb.net/test"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}