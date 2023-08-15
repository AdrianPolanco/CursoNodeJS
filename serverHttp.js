const http = require("http");
const dotenv = require("dotenv").config();
const { createServer } = http;

const Server = createServer((req, res) => {
    console.log(`Mi primer servidor en NodeJS, en el puerto ${PORT}`);
    console.log(req.url);
    console.log(req.method);
    console.log(req.headers);
    if (req.method == "POST") {
        console.log(req.body);
        res.end("RECIBIDO METODO POST");
        return;
    }
    res.end("RECIBIDO METODO GET");
});
const { PORT } = process.env;

Server.listen(PORT, () => {
    console.log(`Puerto corriendo en el puerto ${PORT}`);
});
