const express = require("express");
const dotenv = require("dotenv/config");
const { PORT } = process.env;

const app = express();
//Importando funciones del modulo "modulo.js"
const { sumar, restar } = require("./modules/modulos.cjs");
const restarMiddleware = (req, res, next) => {
    console.log(restar(1, 2));
    next();
};
app.use(restarMiddleware);
app.use("/", express.static("public"));

app.listen(PORT, () => {
    console.log(sumar(1, 2));
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
