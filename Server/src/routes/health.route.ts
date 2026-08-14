import { Router } from "express";

const healthRouter=Router()

healthRouter.get('/',(_,res)=>{
    res.send({
        message:"Backend api is working",
        success:true
    })
})

export default healthRouter