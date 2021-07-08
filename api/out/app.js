"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var mysql_1 = require("mysql");
var dotenv_1 = require("dotenv");
dotenv_1.config();
//parametre pour la connection a la base de données
var connection = mysql_1.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'dbTrain'
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
app.use(body_parser_1.default.json());
app.use(cors_1.default(options));
//GET default 
app.get('/', function (req, response) {
    console.log("it works");
    response.send("it works");
});
//pour recupere la date du jour 
function getDate() {
    var d = new Date();
    var date = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    console.log(date);
    return date;
}
// GET dateDuJour
/*app.get('/dateDuJour', function(req:Request, response:Response){
    console.log(getDate());
    let date = getDate().toString()
    response.send({"date": date});
});*/
//va cherhcher dans le fichier json les données
function getTrains() {
    var data = fs_1.default.readFileSync('trains.json').toString();
    var trains = JSON.parse(data);
    return trains.trains;
}
// GET trains
app.get('/trains/', function (req, response) {
    var trains = getTrains();
    trains.forEach(function (train) {
        response.write("<tr><td>" + train.id + "</td><td>" + train.id2 + "</td><td>" + train.name + "</td></tr>"); // mettre le html dans le string 
    });
    response.end();
});
//GET train  avec id dans le fichier json 
app.get('/train/:id', function (req, response) {
    try {
        var id_1 = req.params.id; //recupere le parametre mis a la place de "id" et le met dans la vairaibale "id"
        var trains = getTrains();
        var train = trains.find(function (t) {
            return t.id2 == id_1;
        });
        //pour verifier si le train a ete trouver
        if (train) {
            response.write(train.id + " " + train.name + '\n');
        }
        else {
            response.status(404).send("trains avec l id " + id_1 + " n a pas ete trouver");
        }
        response.end();
    }
    catch (error) {
        console.log(error);
    }
});
//POST train name sous forme de JSON 
app.post('/trains', function (req, response) {
    console.log(req.body);
    var train = getTrains().find(function (t) {
        return t.id === req.body.id;
    });
    if (train) {
        response.status(400).send("ce train exisite deja" + train.id + " " + train.name + '\n');
    }
    else {
        response.status(201);
        response.send(req.body.id + " " + req.body.name + '\n');
    }
});
//GET db en fonction de la table  
app.get('/db/:table', function (req, response) {
    var table = req.params.table;
    //requete envoyer a la base de données
    connection.query('select * from tbl' + table, function (err, rows, fields) {
        if (err) {
            response.status(500).send("the connection to db don t works");
            console.log(err);
        }
        ;
        response.send(JSON.stringify(rows));
    });
});
// POST Ajouter un nouveau train dans la db 
app.post('/train', function (req, response) {
    var train = {
        abrev: req.body.abrev,
        nom: req.body.nom,
        description: req.body.description
    };
    // requete envoyer a la db
    connection.query('insert into tblTrain (traAbrev,traNom,traDescription) values(?,?,?)', [
        train.abrev,
        train.nom,
        train.description
    ], function (err, result) {
        if (err) {
            response.status(500).send("the train are not add to the db ");
        }
        else {
            response.status(201).send(req.body);
        }
    });
});
// POST Ajouter un nouvelle gare dans la db
app.post('/gare/', function (req, response) {
    var gare = {
        abrev: req.body.abrev,
        nom: req.body.nom,
    };
    // requete envoyer a la base de données
    connection.query('insert into tblGare (garAbrev,garNom) values(?,?)', [
        gare.abrev,
        gare.nom
    ], function (err, result) {
        if (err) {
            response.status(500).send("the train station are not add to the db");
        }
        else {
            response.status(201).send("GARE AJOUTE");
        }
    });
});
// PUT modifier des données des trains dans la db 
app.put('/train/:id', function (req, res) {
    var id = Number(req.params.id);
    var train = {
        abrev: req.body.abrev,
        nom: req.body.nom,
        description: req.body.description
    };
    //requete envoyer a la base de données
    connection.query('update tblTrain set traAbrev = ?,traNom = ?,traDescription = ? where traId =?', [
        train.abrev,
        train.nom,
        train.description,
        id
    ], function (err, result) {
        if (err) {
            res.status(500).send("the train are not edit");
        }
        else {
            res.status(200).send("TRAIN modifié");
        }
    });
});
// PUT modifier des données des gare dans la base de données
app.put('/gare/:id', function (req, res) {
    var id = req.params.id;
    var gare = {
        abrev: req.body.abrev,
        nom: req.body.nom
    };
    //requete envoyer a la base de données
    connection.query('update tblGare set garAbrev = ?,garNom = ? where garId =?', [
        gare.abrev,
        gare.nom,
        id
    ], function (err, result) {
        if (err) {
            res.status(500).send("the train station are not edit");
        }
        else {
            res.status(200).send("gare modifié");
        }
    });
});
//DELETE row in train table dans la base de données
app.delete('/train/:id', function (req, res) {
    var id = req.params.id;
    //requete envoyer a la base de données
    connection.query('delete from tblTrain where traId = ?', [id], function (err, result) {
        if (err) {
            res.status(500).send("the train are not delete");
        }
        else {
            res.status(200).send("train supprmié");
        }
    });
});
//DELETE row in gare table dans la base de données
app.delete('/gare/:id', function (req, res) {
    var id = req.params.id;
    // requete envoyer a la base de données
    connection.query('delete from tblgare where garId = ?', [id], function (err, result) {
        if (err) {
            res.status(500).send("the train station are not delete");
        }
        else {
            res.status(200).send("gare supprmié");
        }
    });
});
// POST test del via post
app.post('/delGare/:id', function (req, response) {
    var id = req.params.id;
    console.log(id);
    // requete envoyer a la base de données
    connection.query('delete from tblgare where garId = ?', [
        id
    ], function (err, result) {
        if (err) {
            response.status(500).send("the train station are not add to the db");
        }
        else {
            response.status(201).send("GARE AJOUTE");
        }
    });
});
//lancement de l api 
app.listen(port, function () {
    console.log('App server up...');
    //connection a la base de données
    connection.connect();
});
//# sourceMappingURL=app.js.map