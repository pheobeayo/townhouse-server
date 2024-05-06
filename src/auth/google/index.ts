import express from "express"
import passport from "passport"
import pool from "../../pg"
import { generateUserToken } from "../../controllers" 
import { userDetails } from "../../types"
import { Strategy } from "passport-google-oauth20"

let googleOAuth=express.Router()

// Google OAuth 2.0 configuration
passport.use(new Strategy({
        clientID: `${process.env.CLIENT_ID}`,
        clientSecret: `${process.env.CLIENT_SECRET}`,
        callbackURL: `${process.env.REDIRECT_GOOGLE_OAUTH_URL}`
    },
    (accessToken:string, refreshToken:string, profile:any, done:any) => {
        // You can handle the user's profile data here
        return done(null, profile);
    }
));

// Serialize user information
passport.serializeUser((user:any, done:any) => {
  done(null, user);
});

// Deserialize user information
passport.deserializeUser((user:any, done:any) => {
  done(null, user);
});

// Google OAuth 2.0 authentication route
googleOAuth.get("/google",
    passport.authenticate('google',{
       scope:['profile','email']
    })
)

// Google OAuth 2.0 callback/redirect route
googleOAuth.get("/redirect",passport.authenticate('google',{failureRedirect:'/'}),async(req:any,res:any)=>{
    try{
        console.log(req)
        // Successful authentication, redirect to a different page or send a response
        const accessToken = req.user.accessToken; // Access token
        const refreshToken = req.user.refreshToken; // Refresh token (if available)
        const profile = req.user; // User profile details
        
        let userProfile:userDetails={
            username:profile._json.name,
            photo:profile._json.picture,
            email:profile._json.email,
            emailVerified:profile._json.email_verified,
            userLang:profile._json.locale,
            provider:profile.provider,
            userBrowser:req.rawHeaders[3],
        }
        pool.query('SELECT * FROM users WHERE email =$1',[userProfile.email],(error,results)=>{
            if(error){
                console.log(error)
                res.status(404).send({error:``})
            }else{
                if(results.rows[0]){
                    //sign in
                    pool.query('UPDATE users SET access_token=$1 WHERE email=$2',[generateUserToken(results.rows[0].id),results.rows[0].email],(error,results)=>{
                        if(error){
                            console.log(error)
                        }else{
                            let access_token=generateUserToken(results.rows[0].id)
                            let stringifyData=JSON.stringify(access_token)
                            res.redirect(`${process.env.CLIENT_URL}?access_token=${stringifyData}`)
                        }
                    })
                }else{
                    //sign up
                    pool.query('INSERT INTO users (username,email,password,email_verified,provider,photo,user_lang,user_browser) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[userProfile.username,userProfile.email,userProfile.provider,userProfile.emailVerified,userProfile.provider,userProfile.photo,userProfile.userLang,userProfile.userBrowser],(error,results)=>{
                        if(error){
                            console.log(error)
                        }else{
                            let access_token=generateUserToken(results.rows[0].id)
                            let stringifyData=JSON.stringify(access_token)
                            res.redirect(`${process.env.CLIENT_URL}?access_token=${stringifyData}`)
                        }
                    })
                }
            }
        })
        //res.redirect('/dashboard')
        //res.send('Logged in with Google');
    }catch(error:any){
        res.status(401).send({error:error.message})
    }
});

// Custom route to access the access token
googleOAuth.get('/getAccessToken', async(req:any, res:any) => {
    try{
        if (req.isAuthenticated()) {
            res.send(req.user.accessToken);
        } else {
            res.status(401).send({error:'Unauthorized'});
        }
    }catch(error:any){
        res.status(501).send({error:error.message})
    }
});

// Logout route
googleOAuth.get('/logout', (req:any, res:any) => {
  req.logout(); // Passport function to clear the session and log out the user
  res.redirect('/'); // Redirect to the home page or any other page after logout
});

export default googleOAuth;
