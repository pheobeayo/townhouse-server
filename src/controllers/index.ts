import pool from "../pg.ts"

export async function createAccount(req:any,res:any){
    try{
        const {}=req.body
    }catch(error:any){
        res.status(501).send({error:error.message})
    }
}
