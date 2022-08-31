const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const express = require('express');
const fileupload = require('express-fileupload');
const config = require('./config');
const torrentStream = require('torrent-stream');
const fs = require('fs');
const body_parser = require('body-parser');
const path = require('path');
const hbjs = require('handbrake-js');
const axios = require('axios');
const app = express();


let all_downloads = {};
let queued_downloads = []
let active_downloads_count = 0;
let max_downloads_counter = 2;

if(!fs.existsSync(path.join(`${config.movie_storage_path}collection`))){
    fs.mkdirSync(path.join(`${config.movie_storage_path}collection`))
}

app.use(fileupload())
app.use(body_parser.urlencoded({extended: true}));
app.use(express.json());
app.set('trust proxy', true)


app.get('/stream/(:show_name)/(:file_name)', (request, response) => {
    return response.sendFile(path.join(`${config.movie_storage_path}collection/${request.params.show_name}/${request.params.file_name}`))
})

app.get('/stream/season/(:show_name)/(:season)/(:file_name)', (request, response) => {
    return response.sendFile(path.join(`${config.movie_storage_path}collection/${request.params.show_name}/${request.params.season}/${request.params.file_name}`))
})

app.post('/new_torrent', async (request, response) => {
    const ip = get_ip(request);
    if(!request.body.token){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "You must provide a login token."
        }))
    }
    if(!request.body.movie_title){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "You must provide a show title."
        }))
    }
    if(!request.body.movie_name){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "You must provide a show name of a torrent."
        }))
    }
    if(!request.body.movie_hash){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "You must provide a torrent hash."
        }))
    }
    try{
        const details = await authenticate_user(request.body.token)
        await axios.post(`http://toolbox.localhost/new_log`, {
            description: `movies.roan.dev download request for user ${details.name} from the IP ${ip} for the show ${request.body.movie_name}`,
        })
    }
    catch(e){
        return response.status(403).send(JSON.stringify({
            successful: false,
            message: "You are not authenticated to use this."
        }))
    }
    if(fs.existsSync(path.join(`${config.movie_storage_path}collection/${request.body.movie_name}`))){
        return response.status(409).send(JSON.stringify({
            successful: false,
            message: "This show name already exists, please try a different name."
        }))
    }
    let movie_title = request.body.magnet_uri ? request.body.magnet_uri.split('dn=')[1].split('&')[0] : request.body.movie_title;
    let movie_hash = request.body.magnet_uri ? request.body.magnet_uri.split('btih:')[1].split('&')[0] : request.body.movie_hash;
    if(active_downloads_count >= max_downloads_counter){
        queued_downloads.push({
            movie_title: movie_title,
            movie_hash: movie_hash,
            movie_name: request.body.movie_name,
            files: request.files
        })
    }
    else{
        start_download(movie_title, movie_hash, request.body.movie_name, request.files);
    }
    return response.send(JSON.stringify({
        success: true,
        message: "Success"
    }))
})

app.listen(config.request_torrent_port, () => {
    console.log(`Request torrent API running on port ${config.request_torrent_port}`)
});

const wss = new WebSocket.Server({port: config.torrent_port});
let clients = []
wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const request = JSON.parse(message);
        switch(request.request_type){
            case "login_auth":
                try{
                    await authenticate_user(request.token)
                    clients.push(ws);
                    ws.send(JSON.stringify({
                        response_type: "login_auth",
                        successful: true
                    }))
                }
                catch(e){
                    ws.send(JSON.stringify({
                        response_type: "login_auth",
                        successful: false
                    }))
                }
                break;
            case "delete":
                all_downloads[request.download_id].destroy();
                delete all_downloads[request.download_id];
                fs.rmdirSync(path.join(`${config.movie_storage_path}torrent-stream/${request.movie_hash}`), { recursive: true });
                active_downloads_count-=1
                break;
            case "ping":
                if(clients.includes(ws)){
                    let active_downloads = []
                    for(let download in all_downloads){
                        if(!all_downloads[download].finished){
                            active_downloads.push({
                                movie_name: all_downloads[download].movie_name,
                                movie_hash: all_downloads[download].movie_hash,
                                id: download,
                                status: all_downloads[download].status
                            })
                        }
                    }
                    ws.send(JSON.stringify({
                        response_type: "pong",
                        active_downloads: active_downloads,
                        successful: true
                    }))
                }
                else{
                    ws.send(JSON.stringify({
                        response_type: "pong",
                        successful: false
                    }))
                }
                break;
            default:
                ws.send(JSON.stringify({
                    response_type: "login_auth",
                    successful: false
                }));
        }
    })

    ws.on('close', () => {
        const index = clients.indexOf(ws);
        if(index > -1){
            clients.splice(index, 1);
        }
    });
})


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


function start_download(movie_title, movie_hash, movie_name, thumbnail_files){
    let endpoint = get_valid_endpoint()
    active_downloads_count+=1
    const magnet_link = `magnet:?xt=urn:btih:${movie_hash}&dn=${encodeURIComponent(movie_title)}&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce`;
    let engine = torrentStream(magnet_link, {
        tmp: path.join(config.movie_storage_path)
    });
    engine.on('ready', () => {
        console.log(`Started downloading ${movie_title}`)
        engine.files.forEach((file) => {
            file.createReadStream();
        });
    });
    engine.movie_hash = movie_hash;
    engine.movie_name = movie_name;

    engine.status = "Downloading"
    engine.finished = false;
    all_downloads[endpoint] = engine;
    engine.endpoint = endpoint;
    engine.on('idle', async () => {
        engine.status = "Finished downloading, now sorting."
        console.log(`Path is ${config.movie_storage_path}torrent-stream/${movie_hash}"`)
        await sort_folder(`${config.movie_storage_path}torrent-stream/${movie_hash}`, movie_name, engine, thumbnail_files)
    })
    engine.on('download', (index) => {
        engine.status = `Downloaded ${(Math.round(((engine.swarm.downloaded/engine.torrent.length) * 100 + Number.EPSILON)))}%`
    })
    return endpoint;
}   
async function sort_folder(path_given, movie_name, engine, thumbnail_files){
    if(!fs.existsSync(path.join(`${config.movie_storage_path}collection/${movie_name}`))){
        fs.mkdirSync(path.join(`${config.movie_storage_path}collection/${movie_name}`))
    }
    if(thumbnail_files){
        try{
            await upload_thumbnail(thumbnail_files.file, path.join(`${config.movie_storage_path}collection/${movie_name}/${thumbnail_files.file.name}`))
        }
        catch(e){
            console.log(e);
        }
    }
    let files = await getFiles(path.join(path_given))
    engine.status = "Beginning sorting."
    let counter = 0;
    let total_convertable_file_count = 0;
    for(let file in files){
        if(config.convertable_file_extensions.includes(files[file].split('.')[files[file].split('.').length-1])){
            total_convertable_file_count+=1;
        }
    }
    for(let file in files){
        if(config.convertable_file_extensions.includes(files[file].split('.')[files[file].split('.').length-1])){
            let convertable_file_extension = files[file].split('.')[files[file].split('.').length-1]
            try{
                counter+=1
                engine.status = `Converting ${convertable_file_extension} ${counter}/${total_convertable_file_count} files`
                await convert_file(files[file], counter, engine, total_convertable_file_count)
            }
            catch(e){
                console.log(e);
            }
        }
    }

    files = await getFiles(path.join(path_given))

    for(let file in files){
        if(files[file].split('.')[files[file].split('.').length-1] === 'mp4'){
            const original = path.join(files[file].replace(file.split('.')[files[file].split('.').length-1], 'mp4'));
            const target = path.join(`${config.movie_storage_path}collection/${movie_name}/${path.join(files[file].replace(files[file].split('.')[files[file].split('.').length-1], 'mp4')).split('/')[path.join(files[file].replace(files[file].split('.')[files[file].split('.').length-1], 'mp4')).split('/').length-1]}`); 
            console.log(original, target)
            await fs.promises.rename(original, target);
        }
    }

    fs.rmdirSync(path_given, { recursive: true });
    fs.openSync(path.join(`${config.movie_storage_path}collection/${movie_name}/${config.finished_txt_file}`), 'a')
    active_downloads_count-=1;
    engine.status = "Complete"
    engine.finished = true;
    all_downloads[engine.endpoint].destroy();
    delete all_downloads[engine.endpoint];
}

async function convert_file(file, counter, engine, total_convertable_file_count){
    return new Promise((resolve, reject) => {
        hbjs.spawn({ input: file, output: file.replace(file.split('.')[file.split('.').length-1], 'mp4') })
        .on('error', err => {
            reject(err)
        })
        .on('progress', progress => {
            engine.status = `Converting ${counter}/${total_convertable_file_count} files, ${progress.percentComplete}% complete. ${progress.eta} remaining`
        })
        .on('complete', async (complete) => {
            resolve();
        })
    })
}
async function getFiles(dir) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

async function upload_thumbnail(file, upload_path){
    return await new Promise((resolve, reject) => {
        file.mv(upload_path, (err) => {
            if (err) {
                reject(new Error(err))
            }
            else{
                resolve();
            }
        })
    })
}

function get_valid_endpoint(){
    let endpoint = Math.random().toString(26).slice(2)
    while(all_downloads[endpoint]){
        endpoint = Math.random().toString(26).slice(2)
    }
    return endpoint
}

function get_ip(request){
    return (request.headers["X-Forwarded-For"] || request.headers["x-forwarded-for"] || '').split(',')[0] || request.client.remoteAddress
}

function check_queue(){
    if(active_downloads_count < max_downloads_counter && queued_downloads.length > 0){
        start_download(
            queued_downloads[0].movie_title, 
            queued_downloads[0].movie_hash,
            queued_downloads[0].movie_name, 
            queued_downloads[0].files
        )

        queued_downloads.splice(0, 1);
    }
    setTimeout(check_queue, 3000);
}

check_queue();