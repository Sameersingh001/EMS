import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Employee from "../model/Employee.js";
import fs from "fs"
import path from "path"
import { error } from "console";


function homepage(req, res){
  res.render("homepage")
}




function showRegister(req,res){
    res.render("Register")
}
function showLogin(req,res){
    res.render("Login")
}

 async function Deshboard(req,res){
    try{
        const data = await Employee.findOne({email: req.user.email})
        res.render("Profile", {data});  
    }catch(err){
        res.send("Server Issue")
    }
}


async function employeepage(req, res) {
    const ID = req.params.id
    const data = await Employee.findById(ID)

    res.render("employeepage", {data})
}


async function allemp(req, res) {
  const employees = await Employee.find({ email: { $ne: "admin.page@gmail.com" } });
  res.render("allemp", {employees})
}


 async function adminEmpUpdate (req,res){
    try{
        const id = req.params.id
        const update = await Employee.findById(id)
        res.render("AdminUpdate", {update});  
    }catch(err){
        res.send("Server Issue")
    }
}

async function Register(req, res) {
      const {
      name,
      username,
      email,
      imageUrl,
      phone,
      about,
      department,
      position,
      salary,
      dateOfJoining,
      address,
      password,
      status
    } = req.body;

  try {
    
    let imagePath = null;
    if (imagePath){
      return res.render("Register", {error: "Please Add an Image"})
    }
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    // check if user exists
    const existingUser = await Employee.findOne({ email });
    if (existingUser) {
      return res.render("Register", { error: "User already registered" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // save new user
    const newEmp = new Employee({
      name,
      username,
      email,
      imageUrl:imagePath,
      phone,
      about,
      department,
      position,
      salary,
      dateOfJoining,
      address,
      password: hashed,
      status
    });

    await newEmp.save();

    // redirect only once, after save
    return res.redirect("/login");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
}



const SECRET = "Authentication@Login_System"; // moved outside for clarity
async function Login(req, res){
    const {email, password} = req.body

 try {
    const Findemp = await Employee.findOne({ email });
    if (!Findemp) {
      return res.render("Login", { error: "Invalid credentials" });
    }
     // bcrypt.compare with await (no callback)
    const match = await bcrypt.compare(password, Findemp.password);
    if (!match) {
      return res.render("Login", { error: "Invalid credentials" });
    }

    // generate JWT
    const token = jwt.sign({ email: Findemp.email }, SECRET, { expiresIn: "1h" });

    // set cookie
    res.cookie("token", token, { httpOnly: true });

    if (Findemp.email === "admin.page@gmail.com") {
      return res.redirect("/admin");   // 👈 open admin page
    } 
   // redirect only once (success)
    return res.redirect(`/profile/${Findemp._id}`);

  } catch (err) {
    return res.send(err,"Server error");
  }
    
} 


async function updateEmployee(req ,res){
  try{
    const employee =await Employee.findById(req.params.id)
    res.render("UpdateEmp", {employee})
  }
  catch(err){
    res.send("server error", err)
  }
  
}

async function saveUpdateEmp(req, res) {
  const ID = req.params.id
  const { username, phone, address, imageUrl, about } = req.body;

  try{
    const employeedata = await Employee.findById(ID)

    let imagePath = employeedata.imageUrl
    if(req.file){
      if(imagePath){
        const oldPath =path.join(process.cwd(), imagePath )
        fs.unlink(oldPath, () => {});
      }
      imagePath = `/uploads/${req.file.filename}`;
    }
      
      const employee = await Employee.findByIdAndUpdate(ID, 
        {
          username,
          phone,
          address,
          about,
          imageUrl:imagePath
        },
      {new:true}
    )
      if (!employee) {
      return res.status(404).send("Employee not found");
    }
    res.redirect(`/profile/${employee._id}`);
  }
  catch(err){
    res.send("server error", err)
  }

}

async function AdminPage(req, res) {

  
  try {
  const email = "admin.page@gmail.com";

  // check if admin already exists
  let existing = await Employee.findOne({ email });

  // if not found, create admin
  if (!existing) {
    const hashed = await bcrypt.hash("admin_open", 10);
    existing = await Employee.create({
      name: "admin",
      username: "Administration_master",
      email,
      password: hashed,
      phone: "0000000000",
      imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/3/294997220/ZX/OC/BE/3365461/acrylic-admin-office-door-sign-board.jpg",
      about: "Admin account",
      department: "Administration",
      position: "Super Admin",
      salary: 0,
      dateOfJoining: new Date(),
      address: "Admin Address",
    });
  }

  
  // fetch all employees (including admin itself)
const employees = await Employee.find({ email: { $ne: "admin.page@gmail.com" } });
const admin = await Employee.findOne({email:"admin.page@gmail.com"})
  // render admin page with employees
  return res.render("admin",  {admin ,employees} );

} catch (err) {

  return res.status(500).send("Server error: " + err.message);
}

}



async function employeeView(req, res){
 try{
   const id = req.params.id
   const emp = await Employee.findById(id)
   res.render("AdminToEmp", {emp})

  }
  catch(err){
      return res.status(500).send("Server error: " + err.message);

  }
 
}



async function updatefromadmin(req, res) {
  const ID = req.params.id
  const { position, salary, status, department } = req.body;
  try{
    const employee = await Employee.findByIdAndUpdate(ID, 
      {
        position,
        salary,
        status,
        department
      },
      {new:true}
    )
      if (!employee) {
      return res.status(404).send("Employee not found");
    }
    res.redirect(`/admin/emp/${ID}`);
  }
  catch(err){
    res.send("server error", err)
  }

}



async function deleteemp(req,res){
  const id = req.params.id
  const deleted = await Employee.findByIdAndDelete(id)

  res.redirect("/admin")

}




function Logout(req, res){
    res.cookie("token","")
    res.redirect("/login")
}





export default {
    showRegister,
    showLogin,
    Register,
    Login,
    Deshboard,
    Logout,
    updateEmployee,
    saveUpdateEmp,
    AdminPage,
    employeeView,
    adminEmpUpdate,
    updatefromadmin,
    deleteemp,
    homepage,
    allemp,
    employeepage
 
}