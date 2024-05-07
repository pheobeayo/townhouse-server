export type Prompt={
    body:{
        prompt:string,
    }
}

export type PromptResponse={
    prompt:string,
    text:any
}

export interface userDetails{
    username:string,
    email:string,
    password?:string
    photo?:string,
    userLang?:string,
    emailVerified:boolean,
    provider:string,
    accessToken?:string,
    refreshToken?:string,
    userBrowser:string,
}
