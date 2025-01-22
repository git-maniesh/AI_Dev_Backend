import "dotenv/config.js"
import http from "http"
import app from './app.js'
import {Server} from "socket.io"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import projectModel from "./models/project.model.js"
import { generateResult } from "./services/ai.service.js"



const port = process.env.PORT || 3000;
const server = http.createServer(app)


// const server = require('http').createServer();
const io = new Server(server,{
    cors:{
        origin: '*',
    }
})

io.use(async(socket,next)=>{
    try {
        const token = socket.handshake.auth?.token ||  socket.handshake.headers.authorization?.split(' ')[1]
        const projectId = socket.handshake.query.projectId


        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return next(new Error("Invalid ProjectId"))
        }
        socket.project = await projectModel.findById(projectId)

        if(!token){
            return next(new Error("Authorization Error"))
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded){
            return next(new Error("Authorization Error"))
        }

        socket.user = decoded;
        next();
    } catch (error) {
        next(error)
        
    }
})
io.on('connection',socket =>{
    socket.roomId = socket.project._id.toString()

    console.log("a user connected ")
    socket.join(socket.roomId)

    socket.on('project-message',async data =>{
        const message = data.message;
        // console.log('message',data)
        const aiIsPresentInMessage = message.includes('@ai');
        socket.broadcast.to(socket.roomId).emit('project-message',data)
        if(aiIsPresentInMessage){

            const prompt = message.replace('@ai','')

            const result = await generateResult(prompt)

            io.to(socket.roomId).emit('project-message',{
                message:result,
                sender:{
                    _id:'ai',
                    email:"Jarvis"
                }
            })
           
            return
        }

        
    })
    socket.on('event',data =>{})
    socket.on('disconnect',() =>{
        console.log("user disconnected")
        socket.leave(socket.roomId)
    })
})

// server.listen(3000)



server.listen(port,() => {
    console.log(`Server is running on port ${port}`);
})

