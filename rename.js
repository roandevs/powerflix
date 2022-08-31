const fs = require('fs');
const path = require('path');
const config = require('./config')
const dir = process.argv[2];
const splitter = process.argv[3];
const orderType = process.argv[4];

const syntax = 'node /movie/location "mr.robot" [order|name]'

if(!dir){
    console.log(`You need to provide a directory, syntax: ${syntax}`)
    process.exit(1)
}

if(!splitter){
    console.log(`You need to provide a splitter, syntax: ${syntax}`)
    process.exit(1)
}

if(!orderType){
    console.log(`You need to provide an order type, syntax: ${syntax}`)
    process.exit(1)
}

let orderEpisodeName = 1;

async function start(){
    try{
        const scanned_dir = await fs.promises.readdir(path.join(dir), { withFileTypes: true });
        for(let file in scanned_dir){
            if(scanned_dir[file].name !== config.finished_txt_file && !config.allowed_thumbnail_exts.includes(scanned_dir[file].name.split('.')[scanned_dir[file].name.split('.').length-1])){
                if(scanned_dir[file].name.split(splitter).length === 1){
                    console.log(`Splitter isn't splitting correctly, check the splitter you set (you set: ${splitter}) when file name is ${scanned_dir[file].name}`)
                    process.exit(1);
                }
                if(orderType === 'order'){
                    const original = path.join(`${dir}/${scanned_dir[file].name}`);
                    const target = path.join(`${dir}/Episode ${orderEpisodeName}.mp4`)
                    await fs.promises.rename(original, target);
                    orderEpisodeName++;
                }
                else{
                    console.log(scanned_dir[file].name.split(splitter)[1][0])
                }
            }
        }
        console.log('Finished ordering')
    }
    catch(e){
        if(e.code){
            if(e.code === 'ENOENT'){
                console.log("Not a valid show directory, be sure you are specifying the right path by testing with the ls command")
                process.exit(1)
            }
        }
        console.log(e)
    }
}

start();
