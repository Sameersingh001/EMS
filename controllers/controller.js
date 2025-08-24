import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Employee from "../model/Employee.js";
import fs from "fs"
import path from "path"
import Task from "../model/TaskDB.js";
import Complaint from "../model/ComplaintDB.js"


function homepage(req, res) {
  res.render("homepage")
}




 function showRegister(req, res) {
  res.render("Register")
}


 async function showLogin(req, res) {

    if(req.user){
     const data = await  Employee.findOne({email : req.user.email})
     if(data.email == "admin.page@gmail.com"){
      return res.redirect(`/admin`)
     }
     return res.redirect(`/profile/${data._id}`)
    }
     
  res.render("Login")

}

async function Deshboard(req, res) {
  try {
    const id = req.params.id
    const data = await Employee.findOne({ email: req.user.email })
    const taskData = await Task.find({ assignedTo: id })
    res.render("Profile", { data, taskData });
  } catch (err) {
    res.send("Server Issue" + err.massage)
  }
}


async function employeepage(req, res) {
  const ID = req.params.id
  const data = await Employee.findById(ID)
  const tasks = await Task.find({ assignedTo: ID })
  res.render("employeepage", { data, tasks })

}


async function allemp(req, res) {
  const Id = req.params.id
  const IdData = await Employee.findById(Id)
  const employees = await Employee.find({ email: { $ne: "admin.page@gmail.com" }, _id: { $ne: req.params.id } });
  res.render("allemp", { employees, IdData })
}


async function adminEmpUpdate(req, res) {
  try {
    const id = req.params.id
    const update = await Employee.findById(id)
    res.render("AdminUpdate", { update });
  } catch (err) {
    res.send("Server Issue" + err.massage)
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
      imageUrl: imagePath,
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
    res.send("Server Issue" + err.massage)
  }
}



const SECRET = "Authentication@Login_System"; // keep it in .env in production

async function Login(req, res) {
  const { email, password } = req.body;

  try {
    const Findemp = await Employee.findOne({ email });
    if (!Findemp) {
      return res.render("Login", { error: "Invalid credentials" });
    }

    // compare password with bcrypt
    const match = await bcrypt.compare(password, Findemp.password);
    if (!match) {
      return res.render("Login", { error: "Invalid credentials" });
    }

  
    // generate JWT
    const token = jwt.sign({ email: Findemp.email }, SECRET, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });

    // ✅ redirect based on role
    if (Findemp.email === "admin.page@gmail.com") {
      return res.redirect("/admin");
    }

    return res.redirect(`/profile/${Findemp._id}`)
  } catch (err) {
    console.error("Login error:", err.message); // log for debugging
    return res.status(500).send("Server Issue: " + err.message);
  }
}


async function updateEmployee(req, res) {
  try {
    const employee = await Employee.findById(req.params.id)
    res.render("UpdateEmp", { employee })
  }
  catch (err) {
    res.send("Server Issue" + err.massage)
  }

}

async function saveUpdateEmp(req, res) {
  const ID = req.params.id
  const { username, phone, address, imageUrl, about } = req.body;

  try {
    const employeedata = await Employee.findById(ID)

    let imagePath = employeedata.imageUrl
    if (req.file) {
      if (imagePath) {
        const oldPath = path.join(process.cwd(), imagePath)
        fs.unlink(oldPath, () => { });
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    const employee = await Employee.findByIdAndUpdate(ID,
      {
        username,
        phone,
        address,
        about,
        imageUrl: imagePath
      },
      { new: true }
    )
    if (!employee) {
      return res.status(404).send("Employee not found");
    }
    res.redirect(`/profile/${employee._id}`);
  }
  catch (err) {
    res.send("Server Issue" + err.massage)
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
    const admin = await Employee.findOne({ email: "admin.page@gmail.com" })

    // render admin page with employees
    return res.render("admin", { admin, employees });

  } catch (err) {
    res.send("Server Issue" + err.massage)
  }

}



async function employeeView(req, res) {
  try {
    const id = req.params.id
    const emp = await Employee.findById(id)
    const taskData = await Task.find({ assignedTo: id })

    res.render("AdminToEmp", { emp, taskData })

  }
  catch (err) {
    return res.status(500).send("Server error: " + err.message);

  }

}



async function updatefromadmin(req, res) {
  const ID = req.params.id
  const { position, salary, status, department } = req.body;
  try {
    const employee = await Employee.findByIdAndUpdate(ID,
      {
        position,
        salary,
        status,
        department
      },
      { new: true }
    )
    if (!employee) {
      return res.status(404).send("Employee not found");
    }
    res.redirect(`/admin/emp/${ID}`);
  }
  catch (err) {
    res.send("server error", err)
  }

}



async function deleteemp(req, res) {
  const id = req.params.id
  const deleted = await Employee.findByIdAndDelete(id)

  res.redirect("/admin")

}



async function TaskForm(req, res) {
  const id = req.params.id
  const emp = await Employee.findById(id)
  res.render("taskForm", { emp })
}


async function Addtask(req, res) {

  const { title, description, deadline, status } = req.body
  const empID = req.params.id

  const newTask = new Task({
    title,
    deadline,
    description,
    status,
    assignedTo: empID
  })

  await newTask.save();

  res.redirect(`/admin/emp/${empID}`)

}

async function updateTask(req, res) {
  const TasksID = req.params.id
  const { status } = req.body

  await Task.findByIdAndUpdate(TasksID, { status })

  res.redirect(req.get("referer") || "/");

}


async function DeleteTask(req, res) {
  const TasksId = req.params.id
  await Task.findByIdAndDelete(TasksId)
  res.redirect(req.get("referer") || "/");
}



//complaint form 


async function complaintForm(req, res){
  const id = req.params.id
  const emp = await Employee.findById(id)
  res.render("ComplaintForm", {emp})
}

async function raisedComplaint(req, res) {
  const id = req.params.id
  const {employeeId, subject, type, description, priority} = req.body

  const complaintsaved = new Complaint({
    employeeId,
    subject,
    type,
    description,
    priority
  })

  await complaintsaved.save()

  res.redirect(`/profile/${id}`)

}


async function showComplaints(req, res){

  try{
    const employeeId = req.params.id
    const data = await Complaint.find({employeeId}).sort({createdAt: -1})
    res.render("MyComplaints", {data})
  }
  catch(err){
    res.send("Server Error", err.massage)
  }

}

async function allComplaints (req, res){
  try{
    const data = await Complaint.find()
    res.render("AdminComplaints", {data})
  }
  catch(err){
    res.send("Server Error", err.massage)
  }
}


async function updateComplaint(req, res) {
  const {status, adminResponse} = req.body 
  const compaintID = req.params.id

  const updateComplaint = await Complaint.findByIdAndUpdate(compaintID, {status, adminResponse})
  res.redirect(req.get("referer") || "/");

}


async function complaintFilter(req, res) {

   const { status } = req.query;
  let filter = {};

  if (status) {
    filter.status = status; // only filter if user selects a status
  }

  const data = await Complaint.find(filter)

  res.render("AdminComplaints", {
    data,
    queryStatus: status || "" // pass selected filter to EJS
  });

}




async function Logout(req, res) {

  const id = req.params.id
  try {
    const employee = await Employee.findById(id)
    if (employee) {
      res.clearCookie("token", {
      httpOnly: true,   // good practice
      secure: true,     // only for HTTPS
      sameSite: "strict"
    });
    }
    res.redirect("/login")
  }
  catch (err) {
    res.send("Server Error" + err.massage)
  }
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
  employeepage,
  TaskForm,
  Addtask,
  updateTask,
  DeleteTask,
  complaintForm,
  raisedComplaint,
  showComplaints,
  allComplaints,
  updateComplaint,
  complaintFilter 

}