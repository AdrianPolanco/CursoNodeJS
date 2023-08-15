const express = require("express");
/* import { PORT, config } from "dotenv";
config(); */

/*Usando variables de entorno con ECMAScript Modules */
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
app.use("/copia", express.static("public/copia.html"));
app.con;
app.listen(PORT, () => {
    console.log(global.global);
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
