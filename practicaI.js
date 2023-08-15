class API {
    constructor() {
        //Importando express y dotenv
        this.express = require("express");
        this.dotenv = require("dotenv").config();
        //Destructuring el process.env.PORT
        const { PORT } = process.env;
        //Instanciando express
        this.app = this.express();
        this.port = PORT;
        //Importando el JSON
        this.BD = require("./BD");
        //Importando UUID
        this.uuid = require("uuid");
        //Inicializando el Router de Express
        this.router = this.express.Router();
        this.Routes();
        /*         this.cors = require("cors"); */
    }
    //Inicializando el servidor
    Init() {
        const { app, express, port, router, cors, Auth } = this;
        /* 
        app.use(
            cors({
                origin: "http://localhost:3000",
                methods: ["POST", "PUT", "DELETE"],
                allowedHeaders: ["Authorization"],
            })
        ); */
        app.use(express.json());
        app.use(Auth);

        //En Express, los Routers sirven para organizar mejor nuestros endpoints, de modo que podamos agruparlos por cierta relacion que tenga, en este caso, al ser una aplicacion muy sencilla, solo utilizara un solo router, pero podria tener muchos mas
        app.use("/router", router);
        app.listen(port, () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
        });
    }

    //Rutas
    Routes(BD = this.BD) {
        const { uuid, router } = this;
        //GET
        router.get("/", (req, res, next) => {
            console.log(req.hostname);
            res.status(200).send(BD);
        });

        router.get("/:id", (req, res, next) => {
            const id = req.params.id;
            const user = BD.filter((user) => user._id === id);

            res.status(200).send(user);
        });
        //POST
        router.post("/create", (req, res, next) => {
            const id = uuid.v4();
            const index = BD.length;

            BD.push({ _id: id, index: index, ...req.body });

            const addedResource = BD[BD.length - 1];

            res.status(201).json({
                code: 201,
                status: "Created",
                message: "Your resource has been created successfully :D",
                createdResource: addedResource,
            });
        });
        //PUT
        router.put("/update-put/:id", (req, res, next) => {
            const id = req.params.id;
            const indexUser = BD.findIndex((user) => user._id === id);
            const foundUser = BD[indexUser];
            const upgradedUser = {
                _id: foundUser._id,
                index: foundUser.index,
                ...req.body,
            };

            BD[indexUser] = upgradedUser;
            res.status(204).send(upgradedUser);
        });
        //DELETE
        router.delete("/delete/:id", (req, res, next) => {
            const id = req.params.id;
            const indexUser = BD.findIndex((user) => user._id === id);
            const foundUser = BD[indexUser];
            const deletedUser = foundUser;

            const newBD = BD.filter((user) => user._id !== id);
            BD = newBD;

            res.status(200).json({
                stauts: "Deleted",
                code: 200,
                deletedResource: deletedUser,
            });
        });
    }

    Auth(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];
        if (token !== "Authorized") {
            return res.status(401).json({
                status: "Unauthorized",
                code: 401,
                message:
                    "You are not authorized in order to request this resource.",
            });
        }

        next();
    }
}

const APIServer = new API();
APIServer.Init();
