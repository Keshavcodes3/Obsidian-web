import bcrypt from "bcrypt"

export const comparePassword=async(password:string,hashed:string)=>{
    const isMatched=await bcrypt.compare(password,hashed)
    return isMatched
}