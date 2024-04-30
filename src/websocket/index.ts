import pool from "../pg";

export default function websocket(io:any){
    io.on("connection", function(socket: any) {
        var clientIp = socket.request.connection.remoteAddress;
        console.log(`a user connected: ${socket.id}, ClientIP : ${clientIp} `);

        socket.on("hello", (data:string, err:any) => {
            io.emit("hello",data)
            console.log(data)
            if(err){
                console.log(err)
            }
        });
        
        //disconnect
        socket.on("disconnect", (reason:any) => {
            console.log(`${reason} has left`);
            io.emit(`${reason} has left`)
        });
    });
}
