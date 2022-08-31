const bcrypt = require("bcryptjs");

async function generate_hash(){
    console.log(await bcrypt.hash(process.argv[2], 12));
}


generate_hash();