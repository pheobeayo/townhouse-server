import pool from "../pg"
import { createTransport } from "nodemailer"
import {genSalt, compare, hash} from "bcryptjs"
import { verify, sign } from "jsonwebtoken"

function createVerificationCode(id:string){
    let date=new Date()
    let min=date.getMinutes()<10?`0${date.getMinutes()}`:date.getMinutes()
    let code=`${min}${date.getFullYear()}`
}

export async function verifyEmail(req:any,res:any){
    try{
        const {email}=req.body
        pool.query('SELECT * FROM users WHERE email = $1',[email],(error,results)=>{
        if(!results.rows[0]){
            let mailTransporter=createTransport({
                service:'gmail',
                auth:{

                }
            })
        }else{}
        })
    }catch(error:any){
        res.status(501).send({error:error.message})
    }
}

export async function createAccount(req:any,res:any){
    try{
        const {}=req.body
    }catch(error:any){
        res.status(501).send({error:error.message})
    }
}

export async function Login(req:any,res:any){
    try{
        const {email, password}=req.body
    }catch(error:any){
        res.status(501).send({error:error.message})
    }
}
