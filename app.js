import express from "express"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import router from "./routes/routes.js"
import methodOverride from "method-override"



const app = express()
const port = 3000


app.set("view engine", "ejs")
app.use(express.json())

connectDB()

app.use(cookieParser())
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method")) 

app.use("/",router)

app.listen(port, ()=>{
    console.log("server is running at port", port)
})