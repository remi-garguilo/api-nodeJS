require("dotenv").config();
const express = require('express')
const con = require('./config/db');
const auth = require("./middleware/auth");
const app = express()
const jwt = require('jsonwebtoken');
process.env.TOKEN_KEY;
const bodyParser = require('body-parser');
var bcrypt = require('bcrypt');


app.use(bodyParser.json());

app.get('/', (req, res) => {
    if (res.statusCode == 200) {
        res.send('Hello World!');
    } else {
        res.send('Error');
    }
})

app.post('/api/users/register', async (req, res) => {
    try {
        const {firstname, lastname, email, password } = req.body;
        if (!(email && password && firstname && lastname)) {
            res.status(400).send("All input is required");
        }
        encryptedPassword = await bcrypt.hash(password, 10);
        con.query('INSERT INTO `user`(`email`, `password`, `firstname`, `lastname`) VALUES (?,?,?,?)', [req.body.email, encryptedPassword, req.body.firstname, req.body.lastname] , function (err, result) {
            if (err) throw err;
            res.status(200).json({ message: "User created successfully" });
        });
        } catch (err) {
            console.log(err);
    }
});

app.post('/api/users/login', (req, res) => {
    const {email,password} = req.body;
    con.query('SELECT id,email,password FROM user WHERE email = ?', [email], async (error, results) => {
        const comparedPassword  = await bcrypt.compare(password, req.body.password);
        if (comparedPassword) {
            res.status(200).json({ message: "User logged in successfully" });
        }
        if (error) throw error;
        if (results.length > 0) {
            const user = {id: results[0].id, email:results[0].email};
            const token = jwt.sign(user , process.env.TOKEN_KEY);
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
 });

 app.put('/api/users/update',auth, async (req, res) => {
    const {email, password} = req.body;
    encryptedPassword = await bcrypt.hash(password, 10);
    con.query('UPDATE user SET email = ?, password = ? WHERE id = ?', [email, encryptedPassword, req.user.id], (error, results) => {
        if (error) throw error;
        if (results) {
            res.status(200).json({ message: "User updated successfully" });
        }
     });
    });

    app.patch('/api/users/groups',auth, async (req, res) => {
        const {group_id_id} = req.body;
        con.query('UPDATE user SET group_id_id = ? WHERE id = ?', [group_id_id, req.user.id], (error, results) => {
            if (error) throw error;
            if (results) {
                res.status(200).json({ message: "User group updated successfully" });
            }
         });
        });

app.get('/api/users',function (req, res) {
        con.query("SELECT firstname,lastname FROM user", async function(err, result) {
            try {
                res.send(result);
            } catch (err) {
                console.error(`Error while getting programming languages `, err.message);
                next(err);
            }
        });
    })

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

app.route('/api/groups/users')
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
    app.get("/api/users/id", auth, (req, res) => {
        con.query("SELECT firstname,lastname,email,group_id_id FROM user WHERE user.id = ?",[req.body.id],  async function(err, result) {
            try {
                if (res.statusCode == 200) {
                    res.send(result);
                } else {
                    res.send('Error');
                }
            } catch (err) {
                console.error(`Error while getting programming languages `, err.message);
                next(err);
            }
        });
      });

    app.delete( "/api/admin/users/delete",auth, (req, res) => {
        con.query("DELETE FROM user WHERE user.id = ?",[req.body.id],  async function(err, result) {
            try {
                if (result) {
                    res.status(200).json({ message: "Delete user successfully" });
                } else {
                    res.send('Error');
                }
            } catch (err) {
                console.error(`Error while getting programming languages `, err.message);
                next(err);
            }
        });
    })
    app.put('/api/admin/users/update',auth, async (req, res) => {
        const {email, password, firstname, lastname, group_id_id, id} = req.body;
        encryptedPassword = await bcrypt.hash(password, 10);
        con.query('UPDATE user SET email = ?, password = ?,firstname = ?, lastname = ?, group_id_id = ? WHERE id = ?', [email, encryptedPassword, firstname, lastname, group_id_id, id], (error, results) => {
            if (error) throw error;
            if (results) {
                res.status(200).json({ message: "User updated successfully" });
            }
         });
    });
    module.exports = app;