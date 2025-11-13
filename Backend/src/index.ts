
import {config} from 'dotenv'
import { databaseConnection } from './db/connectDB.ts';
import path from 'path'
import https from "https"
import http from 'http'
import { app } from './app.ts';
import { Server } from 'socket.io';
import { socketServer } from './Server/socketServer.ts';
import fs from "fs"
import { fileURLToPath } from 'url';


const envPath:(string) = path.resolve("/home/pumpum/coding/WeTalk/Backend/src","../.env")  
config()
    
//Since it's module then it means that __dirname doesnot exists , let's recreate it 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

//Uncomment to enable database connectivity
// await databaseConnection()  
// .then(()=>{
//     try {
//         console.log("Database connected succesfully")
//     } catch (error) {
//         console.log(error)
//     }
// })

const options:https.ServerOptions = {
    key: fs.readFileSync(path.join(__dirname , '../certs/key.pem')),
    cert: fs.readFileSync(path.join(__dirname , '../certs/cert.pem'))
}



const server = http.createServer(app);

const io = new Server(server , {
    cors:{origin:"*",
        credentials:true,
    },
    transports:["polling" , "websocket","webtransport" ]
})

new socketServer(io);


const port = Number(process.env.APP_PORT)

server.listen(port , '0.0.0.0', ()=>{
    console.log("Server listening on port" , port)
})

