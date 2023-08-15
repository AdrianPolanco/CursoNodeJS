/*
 */

class ExpressServer {
    constructor() {
        this.dotenv = require("dotenv").config();
        const { PORT } = process.env;
        this.port = PORT;
        this.express = require("express");
        this.server = this.express();
    }

    Config() {
        const { server, port } = this;
        this.Routes();
        server.listen(port, () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
        });
    }

    Routes(app = this.server, express = this.express) {
        app.use(express.json());
        app.get("/obtener-id/:id", (req, res, next) => {
            console.log(req.path);
            console.log(req.route)
            console.log(req.headers);
            console.log(req.protocol);
            console.log(req.ip);
            req.headers.aut;
            res.status(401).json({ id: req.params.id });
        });
        app.get("/unauthorized", (req, res, next) => {
            res.status(401).json({
                status: "No autorizado",
                message: "Tu no estas autorizado para utilizar este recurso",
            });
        });
        app.post("/imprimir", (req, res, next) => {
            console.log(req.body);
            res.status(200).json({
                status: "OK",
                message: "Recibido",
            });
        });
        app.post("/metodo-post", (req, res, next) => {
            console.log(req.url);
            console.log(req.method);
            console.log(req.headers);
            console.log(req.body);
            next();
        });
    }
}
/*; */

const server = new ExpressServer();
server.Config();
