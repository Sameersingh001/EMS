import mongoose from "mongoose";

const connectDB = async ()=>{
    await mongoose.connect("mongodb+srv://mrsameersingh001:kZUvbFlcBXXWwOXF@employeedb.djxmajg.mongodb.net/")
    .then(() => console.log("Successfully"))
    .catch((err) => console.log("connection error",err))
}   

export default connectDB