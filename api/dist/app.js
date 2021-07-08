"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var mysql_1 = require("mysql");
var dotenv_1 = require("dotenv");
dotenv_1.config();
//parametre pour la connection a la base de données
var connection = mysql_1.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DBNAME
});
var port = 3000; //port de l'api
//cors
var allowedOrigins = ['http://localhost'];
var options = {
    origin: allowedOrigins,
    methods: "DELETE,GET,POST,PUT",
    allowedHeaders: ['Content-Type', 'Authorization'],
};
//instentation de l api express
var app = express_1.default();
app.use(express_1.default.json());
//app.use();
app.use(cors_1.default(options));
//GET default 
app.get('/', function (req, response) {
    console.log("it works");
    response.send("it works");
});
//pour recupere la date du jour 
function getDate() {
    var d = new Date();
    var date = d.getDate() +
        "-" +
        (d.getMonth() + 1) +
        "-" +
        d.getFullYear() +
        " " +
        d.getHours() +
        ":" +
        d.getMinutes() +
        ":" +
        d.getSeconds();
    // console.log(date);
    return date;
}
// GET dateDuJour
app.get('/dateDuJour/', function (req, response) {
    //console.log(getDate());
    var date = getDate().toString();
    response.send({ "date": date });
});
//GET db en fonction de la table  
app.get('/getMessage/', function (req, response) {
    //requete envoyer a la base de données
    connection.query('select * from tblMessage', function (err, rows, fields) {
        if (err) {
            response.status(500).send("the connection to db don t works");
            console.log(err);
        }
        ;
        response.send(JSON.stringify(rows));
    });
});
// POST Ajouter un nouveau train dans la db 
app.post('/postMessage/', function (req, response) {
    var message = {
        text: req.body.text,
        user: req.body.user,
        date: getDate()
    };
    console.log("obj" + message.date);
    // requete envoyer a la db
    connection.query('insert into tblmessage (mesText,mesUser,mesDate) values(?,?,?)', [
        message.text,
        message.user,
        message.date
    ], function (err, result) {
        if (err) {
            response.status(500).send("the message are not add to the db ");
        }
        else {
            response.status(201).send(req.body);
        }
    });
});
//lancement de l api 
app.listen(port, function () {
    console.log('App server up...');
    //connection a la base de données
    connection.connect();
});
