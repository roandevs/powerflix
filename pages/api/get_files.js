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
        try{
            let allFiles = [];
            let hasSeason = false;
            const files = await fs.promises.readdir(path.join(`${config.movie_storage_path}collection/${req.body.show_name}`), { withFileTypes: true });
            for(let show in files){
                if(files[show].name.startsWith('Season')){
                    hasSeason = true;
                }
            }
            for(let show in files){
                if(files[show].name.startsWith('Season')){
                    const season_files = await fs.promises.readdir(path.join(`${config.movie_storage_path}collection/${req.body.show_name}/${files[show].name}`), { withFileTypes: true });
                    let season = {}
                    season[files[show].name] = []
                    for(let file in season_files){
                        if(!config.allowed_thumbnail_exts.includes(season_files[file].name.split('.')[season_files[file].name.split('.').length-1])){
                            season[files[show].name].push(season_files[file].name);
                        }
                    }
                    allFiles.push(season);

                }
                else if(!config.allowed_thumbnail_exts.includes(files[show].name.split('.')[files[show].name.split('.').length-1])){
                    if(files[show].name !== config.finished_txt_file){
                        allFiles.push(files[show].name)
                    }
                }
            }

            return res.send(JSON.stringify({
                successful: true,
                allFiles: sortEpiDisplayOrder(allFiles)
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

function sortEpiDisplayOrder(array){
    let newArray = [];
    for(let item in array){
        if(typeof array[item] === 'object'){
            newArray.push(array[item])
        }
    }

    for(let item in array){
        if(typeof array[item] === 'string'){
            newArray.push(array[item])
        }
    }
    return newArray;
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

