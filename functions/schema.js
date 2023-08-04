import dotenv from "dotenv";
dotenv.config()
import mongoose from "mongoose";
import encrypt from "mongoose-encryption"
const msgSchema = new mongoose.Schema({
    long_url: String,
    short_url: String
})
const userSchema = new mongoose.Schema({
    username: String,
    email:String,
    password: String
})
userSchema.plugin(encrypt, {secret: process.env.SECRET ,encryptedFields:["password"]})
export const user = mongoose.model("user", userSchema)
export default mongoose.model("messages", msgSchema)
