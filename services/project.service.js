import projectModel from "../models/project.model.js";
import mongoose from "mongoose"



export const createProject = async({
    name,userId

}) =>{
    if(!name){
        throw new Error("Name is required")
    }
    if(!userId){
        throw new Error("UserId is required")
    }

    const project = await projectModel.create({
        name,
        users:[userId]
    })
    return project;
}


export const getAllProjectByUserId = async ({userId}) =>{
    if(!userId){
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({
        users:userId
    })
    
    return allUserProjects
}


export const addUserToProject = async ({projectId,users,userId }) =>{
    if (!projectId) {
        throw new Error("Project ID is required")
        
    }
    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid ProjectID")
    }
    if (!users) {
        throw new Error("Project ID is required")
        
    }
    if(!Array.isArray(users)|| users.some(userId => !mongoose.Types.ObjectId.isValid(userId))){
        throw new Error("Invalid UserId in Users arrays")
    }

    if(!userId){
        throw new Error("UserID is required")
    }
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new Error("Invalid UserId")
    }
    console.log(projectId, userId)
    const project = await projectModel.findOne({
        _id:projectId,
        users:userId,
    })
    console.log(project)

    if(!project){
        throw new Error("User doesn't belong to this project")
    }
    const updatedProject = await projectModel.findOneAndUpdate({
        _id:projectId
    },{
        $addToSet:{
            users:{
                $each:users
            }
        }
    },{
        new:true
    })
    return updatedProject
}


export const getProjectById = async({projectId})=>{
    if(!projectId){
        throw new Error("Project ID is required")
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid ProjectID")
    }

    const project = await projectModel.findOne({
        _id:projectId
    }).populate('users')
    return project;
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}