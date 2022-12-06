const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var mysql = require('mysql');
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'api-nodejs',
    port: 8889
});
const my_secret_key = 'youraccesstokensecret';

app.use(bodyParser.json());
// app.use(express.json());

app.post('/api/users/login', (req, res) => {
    const {email, password} = req.body;
  con.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password], (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      const token = jwt.sign({ user: results[0] }, 'my_secret_key');
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
 });

app.get('/', (req, res) => {
    if (res.statusCode == 200) {
        res.send('Hello World!');
    } else {
        res.send('Error');
    }
})

app.route('/api/users')
    .get(function (req, res) {
        con.query("SELECT firstname,lastname FROM user", async function(err, result) {
            try {
                res.send(result);
            } catch (err) {
                console.error(`Error while getting programming languages `, err.message);
                next(err);
            }
        });
    })
    .post(function (req, res) {
        con.query('INSERT INTO `user`(`email`, `password`, `firstname`, `lastname`) VALUES (?,?,?,?)', [req.body.email, req.body.password, req.body.firstname, req.body.lastname] , function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
            res.send('User added');
        });
    });
app.route('/api/users/:id')
    .get(function (req, res) {
        res.send('Get a users id');
    })
    .put(function (req, res) {
        res.send('Update a users id');
    })
    .delete(function (req, res) {
        res.send('Delete a users id');
    });
app.route('/api/groups')
    .get(function (req, res) {
        con.query("SELECT name FROM groups", async function(err, result) {
                console.log("test");
                res.send(result);
        });
    })
    .post(function (req, res) {
        res.send('Add a groups');
    })
app.route('/api/groups/:id')
    .get(function (req, res) {
        res.send('Get a groups id');
    })
    .put(function (req, res) {
        res.send('Update a groups id');
    })
    .delete(function (req, res) {
        res.send('Delete a groups id');
    });
app.route('/api/groups/users/test')
    .get(function (req, res) {
        var usersByGroup = {};
        con.query('SELECT user.firstname,user.lastname,groups.name FROM user INNER JOIN groups WHERE groups.id = user.group_id_id' , function (err, result) {
                result.map((user)=>{
                    if(!usersByGroup[user.name]){
                        usersByGroup[user.name] = [];
                    }
                    usersByGroup[user.name].push(user);

                })
                if (res.statusCode == 200) {
                    res.send(usersByGroup);
                } else {
                    res.send('Error');
                }
        });
    })


app.listen(3000, () => {
    console.log("running on port 3000");
});