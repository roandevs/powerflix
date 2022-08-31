const config = require('../../config');
const jwt = require("jsonwebtoken");

const fs = require('fs');
const path = require('path');

export default async function search(req, res) {
    if(req.method === 'POST'){
        if(!req.body.query){
            return res.status(400).json({
                successful: false,
                message: "You did not provide a query"
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
            let possibleShows = [];
            const shows = await fs.promises.readdir(path.join(`${config.movie_storage_path}collection`), { withFileTypes: true });
            for(let show in shows){
                if(shows[show].name.toLowerCase().includes(req.body.query.toLowerCase())){
                    const show_dir = await fs.promises.readdir(path.join(`${config.movie_storage_path}collection/${shows[show].name}`), { withFileTypes: true });
                    let has_thumbnail = false;
                    let episode_count = 0;
                    let season_count = 0;
                    let special_episode_count = 0;
                    let is_ready = false;
                    let has_season = false;
                    for(let file in show_dir){
                        if(show_dir[file].name.startsWith('Season')){
                            has_season = true;
                        }
                    }
                    for(let file in show_dir){
                        if(show_dir[file].name.startsWith('Season')){
                            const season_dir = await fs.promises.readdir(path.join(`${config.movie_storage_path}collection/${shows[show].name}/${show_dir[file].name}`), { withFileTypes: true });
                            episode_count+=season_dir.length;
                            season_count+=1
                        }
                        else if(config.allowed_thumbnail_exts.includes(show_dir[file].name.split('.')[show_dir[file].name.split('.').length-1])){
                            has_thumbnail = true;
                        }
                        else if(show_dir[file].name === config.finished_txt_file){
                            is_ready = true
                        }
    
                        else if(has_season){
                            special_episode_count+=1;
                        }
                        else{
                            episode_count+=1;
                        }
                    }
                    if(is_ready){
                        possibleShows.push({
                            name: shows[show].name,
                            has_thumbnail: has_thumbnail,
                            season_count: season_count,
                            episode_count: episode_count,
                            special_episode_count: special_episode_count
                        });
                    }
                }
            }
            return res.send(JSON.stringify({
                successful: true,
                possibleShows: possibleShows
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

