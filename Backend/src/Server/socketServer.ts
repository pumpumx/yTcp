import { Server, Socket } from "socket.io";
import { socketEvents } from "./socketEvents.ts";
import { Room } from "./socketRoom.ts";
import { socketUser } from "./socketUser.ts";

export class socketServer {
    private rooms: Map<string, Room> = new Map(); //will be cached in future
    private io:Server;
    constructor(io:Server) {
        this.io = io
        this.io.on('connection', (socket) => this.handleConnection(socket));
    }

    private handleConnection(socket: Socket) { //Responsible for as handling socket connection methods
        console.log("User connected with socketId: ", socket.id);

        socket.on(socketEvents.SEND_USER_INFO, (data: { username: string, roomId: string}) => {
            console.log("User connection recieved")
            this.handleUserJoin(socket , data.username ,  data.roomId);  
        })
    }

    private async handleUserJoin(socket:Socket  , username:string , roomId:string ){
        try {
            let room = this.rooms.get(roomId);
    
            if(!room){
                room = new Room(roomId)
                this.rooms.set(roomId , room);
            }
            const user = new socketUser(username ,socket.id , roomId);
            console.log("user",user)
            room.addUser(user)
            await socket.join(roomId);
            console.log(socket.rooms)
            this.io.to(roomId).emit(socketEvents.USER_JOINED_ROOM,{username,roomId});
        } catch (error) {
            console.log("Some error occured while handeling user joined",error)
        } //Notify the room member that user has joined the room
    }
     
    private handleDisconnect(socket:Socket){
        this.rooms.forEach((room)=>{
            room.getUser().forEach((user) => {
                    if(user.socketId === socket.id){
                        room.removeUser(user.username);
                        console.log(`User ${user.username} removed from the room ${room.roomId}`);
                    }
            })
        })
    }
};

