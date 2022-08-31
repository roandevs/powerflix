const config = require('../../../config');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

export default async function get_thumbnail(req, res) {
    if(req.method === 'GET'){
        const { pid } = req.query;       
        const show_folder = await fs.promises.readdir(path.join(`${config.movie_storage_path}collection/${pid}`), { withFileTypes: true });
        let image_name = null;
        for(let file in show_folder){
            if(config.allowed_thumbnail_exts.includes(show_folder[file].name.split('.')[show_folder[file].name.split('.').length-1])){
                image_name = show_folder[file].name
            }
        }
        if(!image_name){
            return res.status(404).json({
                successful: false
            });
        }
        const filePath = path.join(`${config.movie_storage_path}collection/${pid}/${image_name}`);
        const imageBuffer = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'image/jpg');
        return res.send(imageBuffer);
    }
    return res.status(400).json({
        successful: false
    });
}

async function authenticate_user(token){
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.web_token_secret, (err, user) => {
            if (err) {
                reject(err);
            }
            else{
                return resolve(user);
            }
        })
    });  
}

