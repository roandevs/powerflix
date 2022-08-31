const config = require('../../config');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const {
    client, 
    redisGetValue, 
    redisExecMulti
} = require('./redis');


export default async function login(req, res) {
    if(req.method === 'POST'){
        if(!req.body.name){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a name',
                successful: false
            });
        }
        if(!req.body.password){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a password',
                successful: false
            });
        }        
        const password = req.body.password;
        const ip = get_ip(req);
        const flood_key = `${ip}.flood`
        const flood_count = client.get(flood_key);
        if(!await bcrypt.compare(password, config.hashed_password)){
            if(flood_count){
                try{
                    let multi = client.multi();
                    multi.incr(flood_key);
                    multi.expire(flood_key, 3600);
                    const result = await redisExecMulti(multi);
                    let count = result[0]
                    if(count >= 5){
                        return res.status(429).json({
                            message: 'You have reached the maximum number of logins. Please wait for an hour or contact roan.',
                            successful: false
                        });
                    }
                }
                catch(e){
                    console.log(e);
                }
            }
            else{
                client.setex(flood_key, 3600, 1);
            }
            return res.status(401).json({
                message: 'Your password is incorrect.',
                successful: false
            });
        }

        const failure_count = await redisGetValue(flood_key)
        if(failure_count){
            let max_attempts_exceeded = Number(failure_count) >= 5
            if(max_attempts_exceeded){
                return res.status(429).json({
                    message: 'You have reached the maximum number of logins. Please wait for an hour or contact roan.',
                    successful: false
                }); 
            }
            else{
                client.del(flood_key);
            }
        }
        await axios.post(`http://toolbox.localhost/new_log`, {
            description: `movies.roan.dev web login for user ${req.body.name} from the IP ${ip}`,
        })
        const token = jwt.sign({name: req.body.name}, config.web_token_secret, {expiresIn: '24h'});
	console.log(token)
        return res.send(JSON.stringify({
            message: '',
            successful: true,
            token: token
        }))
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
        successful: false
    });
}


function get_ip(request){
    return (request.headers["X-Forwarded-For"] || request.headers["x-forwarded-for"] || '').split(',')[0] || request.client.remoteAddress
}
