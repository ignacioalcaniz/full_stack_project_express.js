import { connect } from "mongoose"
import "dotenv/config"





 const MONGO_URL_COMPASS = "mongodb://localhost:27017/";



export const initMongoDb=async()=>{
    try {
   await connect(MONGO_URL_COMPASS)
    } catch (error) {
        throw new Error(error)
    }
}