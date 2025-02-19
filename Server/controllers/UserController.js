const User = require('../models/user');



const list = (req, res) => {
    User.find()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ error: "Failed to retrieve users", details: err }));
};




module.exports = {  list};