const mongoose = require("mongoose");

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected DB");
    }catch(error){
        console.error("error in connection",error);
    }
};
module.exports = connectDB;