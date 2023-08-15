const bcryptPackage = require("bcrypt");
const express = require("express");
const corsPackage = require("cors");
const jsonwebtoken = require("jsonwebtoken");
const uuidPackage = require("uuid");
const dotenv = require("dotenv");
const fs = require("fs");
const { type } = require("os");
dotenv.config();
const { PORT, ROUNDS } = process.env;
class AuthAPI {
    constructor() {
        this.app = express();
        this.bcrypt = bcryptPackage;
        this.cors = corsPackage;
        this.jwt = jsonwebtoken;
        this.uuid = uuidPackage;
        this.jsonRoute = `${__dirname}\\BD.json`
        this.AdminRoutes = express.Router();
        this.UsersRoutes = express.Router();
        this.PublicRoutes = express.Router();
        this.PublicRouter();  
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

        app.use(cors());
        app.use(express.json());
        app.use(PublicRoutes);
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    }

    ReadJSON(route){
        const jsonFile = fs.readFileSync(route, { encoding: "utf8" });
        const jsonContent = JSON.parse(jsonFile);
        return jsonContent
    }

    WriteJSON(route, content){
        const jsonString = JSON.stringify(content, null, 4)
        fs.writeFile(route, jsonString, "utf8", () =>{
            try {
                console.log("Cambios guardados exitosamente")
            } catch (error) {
                console.log(error)
                return res.status(500).json({
                    status: "Internal Server Error",
                    code: 500,
                    success: false,
                    message: "No se pudo completar la operacion exitosamente",
                    error
                })
            }
        })
    }

    EmailPassword(req, res, next){
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

            next()
    }

    PublicRouter() {
        const { PublicRoutes, uuid, bcrypt, jsonRoute, ReadJSON, WriteJSON, EmailPassword } = this;
        //Consulta el numero de usuarios actual en el BD.json
        PublicRoutes.get("/numero-usuarios", (req, res, next) => {
            const BD = ReadJSON(jsonRoute).users
            const numUsuarios = BD.length;

            res.status(200).json({
                status: "Succeed",
                code: 200,
                usuariosRegistrados: numUsuarios,
            });
        });
        //Agrega un nuevo usuario al BD.json
        PublicRoutes.post("/crear-usuario", EmailPassword, async (req, res, next) => {
            
            //Leyendo, convirtiendo y manipulando el JSON
            const jsonContent = ReadJSON(jsonRoute)
            const { users } = jsonContent;
            const id = uuid.v4();
            const hashedPassword = await bcrypt.hash(req.body.password, Number(ROUNDS))
            req.body.password = hashedPassword
            const index = users.length

            //Creando el nuevo objeto, agregandolo al objeto y convirtiendolo de vuelta a JSON
            const createdResource = {_id: id, index, ...req.body}
            users.push(createdResource)
            WriteJSON(jsonRoute, jsonContent)

            //Dando la respuesta exitosa
            res.status(201).json({
                status: "Succeed",
                code: 201,
                message: "Recurso creado correctamente",
                created__Resource: createdResource
            })
        });
    }
}

const AuthServer = new AuthAPI();
AuthServer.Init();
