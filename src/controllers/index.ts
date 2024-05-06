import pool from "../pg"
import { google } from "googleapis"
import { join } from "path"
import { authenticate } from "@google-cloud/local-auth"
import {createReadStream } from 'fs'
import { createTransport } from "nodemailer"
import {genSalt, compare, hash} from "bcryptjs"
import { verify, sign } from "jsonwebtoken"

const SERVICE_ACCOUNT=join(process.cwd(),'service_account.json')
const gmail:any = google.gmail({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
        keyFile: `${SERVICE_ACCOUNT}`,
        scopes:['https://www.googleapis.com/auth/gmail.send']
    })
});


function createVerificationCode(id:string){
    let date=new Date()
    let min=date.getMinutes()<10?`0${date.getMinutes()}`:date.getMinutes()
    let code=`${min}${date.getFullYear()}`
    return code
}

async function sendEmail(emailTo:any,subject:string,text:string){
    try{
        let email={
            to:`${emailTo}`,
            from:`${process.env.TRANSPORTER_EMAIL}`,
            subject,
            text
        }
        
        let result=await gmail.users.messages.send({
            userId:`${process.env.TRANSPORTER_EMAIL}`,
            resource:email,
        })

        console.log("email sent successfully", result.data)
    }catch(error:any){
        console.log('Error sending email:', error)
    }
}

export async function verifyEmail(req:any,res:any){
    try{
        const {email, code}=req.body
        //let code=createVerificationCode()

        pool.query('SELECT * FROM users WHERE email = $1',[email],(error,results)=>{
        if(!results.rows[0]){
            sendEmail(email,`Townhouse verification code`,`Your verification code ${code}`
)
        }else{
            res.send({error:`This account already exist!`})
        }
        })
    }catch(error:any){
        res.status(501).send({error:error.message})
    }
}

export async function createAccount(req:any,res:any){
    try{
        const {username, email, password, user_browser, provider, ip_address, last_time_loggedin}=req.body
        if (username&&email&&password) {
            const salt=await genSalt(10);
            const hashedPassword=await hash(password,salt);
            pool.query('SELECT * FROM users WHERE email=$1',[email],(error,results)=>{
                if(error){
                    console.log(error)
                }else{
                    if(results.rows[0].email){
                        res.status(408).send({error:`This account exists!, Try logging in`})
                    }else{
                        pool.query('INSERT INTO users (username, email, password, last_time_loggedin, user_browser, provider) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [username, email, hashedPassword, last_time_loggedin, user_browser],(error, results) => {
                            if (error) {
                                console.log(error)
                                res.status(408).send({error:`Account using ${email} already exist!`})
                            }else{
                                res.status(201).send({
                                    msg:`Welcome ${results.rows[0].username}`,
                                    data:{
                                        username:results.rows[0].username,
                                        email:results.rows[0].email,
                                        photo:results.rows[0].photo,
                                        access_token:generateUserToken(results.rows[0].id)
                                    }
                                })
                            }
                        })
                    }
                }
            })       
        } else {
            res.status(403).send({error:"Fill all the required fields!!"})
        }
    }catch(error:any){
        res.status(501).send({error:error.message})
    }
}

export async function login(req:any,res:any){
    try{
        const {email, password, user_lat_long, ip_address, last_time_loggedin, user_browser}=req.body
        if(email&&password&&last_time_loggedin&&ip_address){
            pool.query('SELECT * FROM users WHERE email = $1',[email], async(error,results)=>{
                if(error){
                    console.log(error)
                    res.status(400).send({error:'Failed to sign in, try again!'})
                }else{
                    if(results.rows[0]){
                        if(results.rows[0].email&&await compare(password,results.rows[0].password)){
                            pool.query('UPDATE users SET last_time_loggedin=$1, user_browser= $2 WHERE email = $3 RETURNING *',[last_time_loggedin,user_browser,results.rows[0].email],(error,results)=>{
                                if(error){
                                    console.log(error)
                                }else{
                                    res.status(201).send({
                                        data:{
                                            username:results.rows[0].username,
                                            photo:results.rows[0].photo,
                                            email:results.rows[0].email,
                                            access_token:generateUserToken(results.rows[0].id)
                                        }
                                    })
                                }
                            })
                        }else if(await compare(password,results.rows[0].password)===false){
                            res.status(401).send({error:'You have enter the wrong password'})
                        } 
                    }else{
                        res.status(404).send({error:`This account does not exist!`})
                    }
                }
            })
        }else{
            res.status(403).send({error:"Fill all the required fields!!"})
        }
    }catch(error:any){
        res.status(501).send({error:error.message})
    }
}

export async function getUsers(req:any,res:any){
    try {
        pool.query('SELECT * FROM users', (error, results) => {
            if (error) {
                console.log(error)
                res.status(404).send({error:`Failed to get users.`})
            }else{
                res.status(200).json(results.rows)
            }
        })
    } catch (error:any) {
        res.status(500).send({error:error.message})
    }
}


export async function protectUser(req:any,res:any,next:any){
    let token
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
        try{
            token=req.headers.authorization.split(' ')[1]
            verify(token,`${process.env.JWT_SECRET}`)
            next()
        }catch(error:any){
            res.status(401).send({error:'Not Authorised'})
        }
    }
    if(!token){
        res.status(401).send({error:'No Token Available'})
    }
}

export async function getUserDetails(req:any,res:any){
    try {
        const { email } = req.params
        pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
            if (error) {
                console.log(error)
                res.status(404).send({error:`Account associated with the email address ${email} does not exist!`})
            }else{
                if(results.rows[0]){
                    res.status(200).json({
                        data:{
                            username:results.rows[0].username,
                            email:results.rows[0].email,
                            photo:results.rows[0].photo,
                            token:generateUserToken(results.rows[0].id)
                        }
                    })
                }else{
                    res.status(404).send({error:`Account associated with the email address ${email} does not exist!`})
                }
            }
        })
    } catch (error:any) {
        res.status(500).send({error:error.message})
    }
}

export async function authenticateUserWithAccessToken(req:any,res:any){
    try{
        let {access_token}=req.params
        pool.query('SELECT * FROM users WHERE access_token =$1 AND provider=$2',[access_token,'google'],(error,results)=>{
            if(error){
                console.log(error)
                res.status(501).send({error:error})
            }else{
                if(!results.rows[0]){
                    res.status(404).send({error:`This account does not exist!`})
                }else{
                    let data:any={
                        username:results.rows[0].username,
                        email:results.rows[0].email,
                        photo:results.rows[0].photo,
                        access_token:results.rows[0].access_token
                    }
                    res.status(400).send({
                        msg:`Authenticated successfully`,
                        data
                    })
                }
            }
        })
    } catch (error:any) {
        res.status(500).send({error:error.message})
    }
}

export function generateUserToken(id:string){
    return sign({id},`${process.env.JWT_SECRET}`,{
        expiresIn:'10d'
    })
}
