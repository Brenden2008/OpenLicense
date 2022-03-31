// Includes

const express = require("express");
const { v4: uuidv4 } = require('uuid');
const { Deta } = require('deta');
const moment = require('moment');

const detasdk = Deta();
const db = detasdk.Base("OpenLicense");

const app = express();

// For parsing application/json
app.use(express.json());
  
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const config = {
    username: 'Admin',
    password: 'Password',
    apikey: 'arandomstringhere'
};

// Params:
// apikey
//
// Body:
// license_name
// license_description
// license_expires
// license_type

app.post("/api/createlicense", async (req, res) => {
    if (req.query.apikey == config.apikey) {
        let myuuid = uuidv4();
        var license = {
            license_name: req.body.license_name,
            license_description: req.body.license_description,
            license_id: myuuid,
            license_expires: req.body.license_expires,
            license_type: req.body.license_type
        }
        try {
            await db.put(license, myuuid)
            res.status(200).json({ success: 1, license: license })
        } catch (err) {
            res.status(500).json({ success: 0, error: "License could not be created." })
        }
    } else {
        res.status(401).json({ success: 0, error: "APIKEY does not match on the server." })
    }
});

// Params:
// apikey
// license_id
app.get("/api/getlicense", async (req, res) => {
    try {
        var license = await db.get(req.query.license_id);
        if (license != null) {
            if (license.license_expires == 'false') {
                res.status(200).json({ success: 1, license: license, license_isvalid: true })
            } else if (moment(license.license_expires, "DD/MM/YYYY").isAfter(moment(new Date(), "DD/MM/YYYY"), 'day')) {
                res.status(500).json({ success: 0, error: "License expired." })
            } else {
                res.status(200).json({ success: 1, license: license, license_isvalid: true })
            }
        }
    } catch (err) {
        res.status(500).json({ success: 0, error: "License could not be read." })
    }
});

module.exports = app;