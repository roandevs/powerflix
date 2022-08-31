const config = require('../../config');
const SocksProxyAgent  = require('socks-proxy-agent');
const jwt = require("jsonwebtoken");
const axios = require('axios');
const net = require('net');

export default async function search_show(req, res) {
    if(req.method === 'POST'){
        if(!req.body.request_type){
            return res.status(400).json({
                successful: false
            });
        }
        switch(req.body.request_type){
            case "search":
                if(!req.body.show_name){
                    return res.status(400).json({
                        successful: false,
                        message: "You did not provide a show name"
                    });
                }
                else if(!req.body.token){
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
                    const is_proxy_online = await check_proxy_online(config.proxy.host,config.proxy.port);
                    if(!is_proxy_online){
                        return res.status(400).json({
                            successful: false,
                            message: "The proxy used to search a show is down, please contact Roan to fix this."
                        });
                    }
                    const info = {
                        host: config.proxy.host,
                        port: config.proxy.port, 
                        userId: config.proxy.username,
                        password: config.proxy.password
                    }
                    const httpAgent = new SocksProxyAgent(info);
                    const axios_proxy_agent = axios.create({httpAgent: httpAgent, httpsAgent: httpAgent}); 
                    const pirate_result = await axios_proxy_agent.get(`https://apibay.org/q.php?q=${req.body.show_name}&cat=`);
                    if(typeof pirate_result.data === 'string'){
                        if(pirate_result.data.startsWith("<html>")){
                            throw "Tpb error"
                        }
                    }
                    return res.send(JSON.stringify({
                        successful: true,
                        results: pirate_result.data
                    }))
                   
                } 
                catch(e){
                    console.log(e)
                    return res.status(400).json({
                        successful: false,
                        message: "Something went wrong while searching tpb, contact Roan and tell him to check/update the pirate bay link."
                    });

                }
            default:
                break;
        }
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
        successful: false
    });
}


async function check_proxy_online(host, port){
    return new Promise((resolve, reject) => {
        const conn = net.Socket()
        conn.connect(port, host, () => {
            resolve(true)
        })
        conn.on('error', () => {
            resolve(false);
        })
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

