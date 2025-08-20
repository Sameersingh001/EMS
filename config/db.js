import mongoose from "mongoose";

const connectDB = async ()=>{
    await mongoose.connect("mongodb://127.0.0.1:27017/EmployeesDB")
    .then(() => console.log("Successfully"))
    .catch((err) => console.log("connection error",err))
}

export default connectDB