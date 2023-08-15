const bcryptPackage = require("bcrypt");
const express = require("express");
const corsPackage = require("cors");
const jsonwebtoken = require("jsonwebtoken");
const uuidPackage = require("uuid");
const dotenv = require("dotenv");
const BD = require("./BD");
const fs = require("fs");

class AuthAPI {
    constructor() {
        this.app = express();
        this.bcrypt = bcryptPackage;
        this.cors = corsPackage;
        this.jwt = jsonwebtoken;
        this.uuid = uuidPackage;
        this.AdminRoutes = express.Router();
        this.UsersRoutes = express.Router();
        this.PublicRoutes = express.Router();
        this.PublicRouter();
        dotenv.config();
    }

    Init() {
        const {
            app,
            bcrypt,
            cors,
            jwt,
            uuid,
            AdminRoutes,
            UsersRoutes,
            PublicRoutes,
        } = this;
        const { PORT, ROUNDS } = process.env;
        app.use(cors());
        app.use(express.json());
        app.use(PublicRoutes);
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    }

    PublicRouter() {
        const { PublicRoutes, uuid, bcrypt } = this;
        const { ROUNDS } = process.env;
        PublicRoutes.get("/numero-usuarios", (req, res, next) => {
            const numUsuarios = BD.length;

            res.status(200).json({
                status: "Succeed",
                code: 200,
                usuariosRegistrados: numUsuarios,
            });
        });

        PublicRoutes.post("/crear-usuario", async (req, res, next) => {
            if (!req.body.email)
                return res.status(400).json({
                    status: "Bad request",
                    code: 400,
                    success: false,
                    message:
                        "Tu solicitud es incorrecta, se requiere la propiedad email en el cuerpo de la solicitud",
                });

            if (!req.body.password)
                return res.status(400).json({
                    status: "Bad request",
                    code: 400,
                    succe: false,
                    message:
                        "Tu solicitud es incorrecta, se requiere la propiedad password en el cuerpo de la solicitud",
                });

            const jsonFile = fs.readFileSync("./BD.json", { encoding: "utf8" });

            const jsonContent = JSON.parse(jsonFile);
            const { users } = jsonContent;
            const id = uuid.v4();
            //const password = await bcrypt.hash(req.body.password, ROUNDS);

            console.log(`Id generado: ${id}, Password hasheada: ${ROUNDS}`);
        });
    }
}

const AuthServer = new AuthAPI();
AuthServer.Init();
