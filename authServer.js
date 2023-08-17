const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const dotenv = require("dotenv");
const fs = require("fs");
const moment = require("moment")();
const { type } = require("os");
dotenv.config();
const { PORT, ROUNDS, KEY } = process.env;
class AuthAPI {
    constructor() {
        this.app = express();
        moment.locale("es");
        this.jsonRoute = `${__dirname}\\BD.json`;
        this.jsonFile = this.ReadJSON(this.jsonRoute);
        this.AdminRoutes = express.Router();
        this.UsersRoutes = express.Router();
        this.PublicRoutes = express.Router();
        this.PublicRouter();
        this.UserRouter();
    }

    Init() {
        const { app, UsersRoutes, PublicRoutes } = this;

        app.use(cors());
        app.use(express.json());
        app.use(PublicRoutes);
        app.use(UsersRoutes);
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    }

    ReadJSON(route) {
        const jsonFile = fs.readFileSync(route, { encoding: "utf8" });
        const jsonContent = JSON.parse(jsonFile);
        return jsonContent;
    }

    WriteJSON(content, route) {
        const jsonString = JSON.stringify(content, null, 4);
        fs.writeFile(route, jsonString, "utf8", () => {
            try {
                console.log("Cambios guardados exitosamente");
                return true;
            } catch (error) {
                console.log(error);
                return error;
            }
        });
    }

    EmailPasswordRole(req, res, next) {
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

        if (!req.body.role)
            return res.status(400).json({
                status: "Bad request",
                code: 400,
                succe: false,
                message:
                    "Tu solicitud es incorrecta, se requiere la propiedad role en el cuerpo de la solicitud",
            });

        next();
    }

    CheckRole(req, res, next) {
        if (req.body.role.toLowerCase() !== "user" && "admin")
            return res.status(400).json({
                status: "Bad request",
                code: 400,
                success: false,
                message:
                    "Tu solicitud es incorrecta, no hay un rol valido en este usuario",
            });

        next();
    }

    CheckToken(req, res, next) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, KEY);

            req.body.authenticatedId = decoded.id;
            req.body.role = decoded.role;

            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({
                status: "No autorizado",
                code: 401,
                message: "El token no es valido o ha expirado",
                message: error,
            });
        }
    }

    CheckTask(req, res, next) {
        if (
            !req.body.taskTitle ||
            !req.body.taskBody ||
            !req.body.taskPriority ||
            !req.body.taskStatus
        )
            return res.status(400).json({
                status: "Bad request",
                code: 400,
                message: "Falta un valor requerido en la tarea",
            });

        next();
    }
    PublicRouter() {
        const {
            PublicRoutes,
            jsonRoute,
            WriteJSON,
            EmailPasswordRole,
            CheckRole,
            jsonFile,
        } = this;
        //Consulta el numero de usuarios actual en el BD.json
        PublicRoutes.get("/numero-usuarios", (res) => {
            const BD = jsonFile.users;
            const numUsuarios = BD.length;

            res.status(200).json({
                status: "Succeed",
                code: 200,
                usuariosRegistrados: numUsuarios,
            });
        });
        //Agrega un nuevo usuario al BD.json
        PublicRoutes.post(
            "/crear-usuario",
            EmailPasswordRole,
            CheckRole,
            async (req, res) => {
                //Leyendo, convirtiendo y manipulando el JSON
                const jsonContent = jsonFile;
                const { users } = jsonContent;
                const id = uuid.v4();
                const hashedPassword = await bcrypt.hash(
                    req.body.password,
                    Number(ROUNDS)
                );
                req.body.password = hashedPassword;
                const index = users.length;

                //Creando el nuevo objeto, agregandolo al objeto y convirtiendolo de vuelta a JSON
                const createdResource = { _id: id, index, ...req.body };
                users.push(createdResource);
                try {
                    WriteJSON(jsonContent, jsonRoute);
                    res.status(201).json({
                        status: "Succeed",
                        code: 201,
                        message: "Usuario creado y guardado correctamente",
                        created__Resource: createdResource,
                    });
                } catch (error) {
                    return res.status(500).json({
                        status: "Internal Server Error",
                        code: 500,
                        success: false,
                        message:
                            "No se pudo completar la operacion exitosamente",
                        error,
                    });
                }

                //Dando la respuesta exitosa
            }
        );

        PublicRoutes.post("/iniciar-sesion", async (req, res) => {
            const { user_email, user_password } = req.body;
            const { jsonFile } = this;

            const jsonContent = jsonFile;
            const { users } = jsonContent;

            const foundUser = await (async () => {
                for (const user of users) {
                    if (
                        user.email === user_email &&
                        (await bcrypt.compare(user_password, user.password))
                    )
                        return user;
                }
            })();
            console.log("Usuario encontrado");
            console.log(foundUser);

            if (!foundUser)
                return res.status(401).json({
                    status: "No autorizado",
                    code: 401,
                    message: "Credenciales invalidas",
                });

            const token = jwt.sign(
                {
                    id: foundUser._id,
                    name: foundUser.name,
                    role: foundUser.role,
                },
                KEY,
                { expiresIn: "1d" }
            );

            res.status(200).header("Authorization", `Bearer ${token}`).json({
                status: "OK",
                code: 200,
                message: "Has sido autenticado correctamente.",
            });
        });
    }

    UserRouter() {
        const {
            jsonRoute,
            UsersRoutes,
            CheckToken,
            WriteJSON,
            CheckRole,
            CheckTask,
            jsonFile,
        } = this;

        UsersRoutes.post(
            "/crear-tarea",
            CheckToken,
            CheckRole,
            CheckTask,
            (req, res) => {
                const jsonContent = jsonFile;
                const users = jsonContent.users;
                const id = req.body.authenticatedId;
                const index = users.findIndex((user) => user._id === id);

                const tasks = users[index].tasks;
                const task = {
                    taskId: uuid.v1(),
                    taskTitle: req.body.taskTitle,
                    taskBody: req.body.taskBody,
                    taskPriority: req.body.taskPriority,
                    taskStatus: req.body.taskStatus,
                    creation: moment.format("MMMM Do YYYY, h:mm:ss a"),
                };

                tasks.push(task);

                WriteJSON(jsonContent, jsonRoute);

                res.status(201).json({
                    status: "Created",
                    code: 201,
                    message: "Tarea creada con correctamente",
                    task,
                });
            }
        );
    }
}

const AuthServer = new AuthAPI();
AuthServer.Init();
