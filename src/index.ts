import express from "express";
import cors from "cors";
import router from "./routes"
import passport from "passport"
import session from "express-session"
import { Server } from "socket.io"
import websocket from "./websocket"
import drive from "./drive"
import googleOAuth from "./auth/google"
import { config } from "dotenv";
config();

const app=express();

// Initialize Passport and use sessions
app.use(session({ 
    secret: `${process.env.JWT_SECRET}`, 
    resave: true, 
    saveUninitialized: true 
}));
//app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

const cors_option = {
  origin:["http://localhost:3000"],
  methods: ["GET", "POST", "DELETE", "UPDATE", "PATCH", "PUT"]
}

//middleware
app.use(express.json())
app.use(cors(cors_option))
app.use(express.urlencoded({extended:false}))
app.use('/api',router)
app.use('/drive',drive)
app.use('/auth/googleOAuth',googleOAuth)

let port=process.env.PORT||8000
let server=app.listen(port,()=>{
  console.log(`Server running on port ${port}`)
})
let io=new Server(server,{
    cors:{
        origin:cors_option.origin,
        methods:cors_option.methods,
        credentials:true
    },
    allowEIO3:true,
    maxHttpBufferSize:1e8
});
websocket(io);
