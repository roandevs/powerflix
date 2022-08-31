const config = require('../../config');
const jwt = require("jsonwebtoken");

const fs = require('fs');
const path = require('path');

export default async function get_files(req, res) {
    if(req.method === 'POST'){
        if(!req.body.show_name){
            return res.status(400).json({
                successful: false,
                message: "You did not provide a valid show name"
            });
        }
        if(!req.body.token){
            return res.status(400).json({
                successful: false,
                message: "You did not provide an auth token"
            });
        }   
        try{
            await authenticate_user(req.body.token);
        }
        catch(e){
            console.log(e);
            return res.status(403).json({
                successful: false,
                message: "You are not logged in/authorized to make this request."
            });
        }   

        try{
            
            await fs.promises.readdir(path.join(`${config.movie_storage_path}collection/${req.body.show_name}`), { withFileTypes: true });
            fs.rmdirSync(path.join(`${config.movie_storage_path}collection/${req.body.show_name}`), { recursive: true });
            return res.send(JSON.stringify({
                successful: true,
            }))
        }
        catch(e){
            console.log(e);
            return res.status(404).json({
                successful: false,
                message: "Something went wrong when finding the shows, please contact Roan."
            });

        }
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
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

