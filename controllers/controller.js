import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Employee from "../model/Employee.js";
import fs from "fs"
import path from "path"
import Task from "../model/TaskDB.js";

function homepage(req, res) {
  res.render("homepage")
}

function showRegister(req, res) {
  res.render("Register")
}
function showLogin(req, res) {
  res.render("Login")
}

async function Deshboard(req, res) {
  try {
    const id = req.params.id
    const data = await Employee.findOne({ email: req.user.email })
    const taskData = await Task.find({ assignedTo: id })
    res.render("Profile", { data, taskData });
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function employeepage(req, res) {
  try {
    const ID = req.params.id
    const data = await Employee.findById(ID)
    res.render("employeepage", { data })
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function allemp(req, res) {
  try {
    const Id = req.params.id
    const IdData = await Employee.findById(Id)
    const employees = await Employee.find({ email: { $ne: "admin.page@gmail.com" }, _id: { $ne: req.params.id } });
    res.render("allemp", { employees, IdData })
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function adminEmpUpdate(req, res) {
  try {
    const id = req.params.id
    const update = await Employee.findById(id)
    res.render("AdminUpdate", { update });
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
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
    if (imagePath) {
      return res.render("Register", { error: "Please Add an Image" })
    }
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const existingUser = await Employee.findOne({ email });
    if (existingUser) {
      return res.render("Register", { error: "User already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

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
    return res.redirect("/login");
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

const SECRET = "Authentication@Login_System";
async function Login(req, res) {
  const { email, password } = req.body

  try {
    const Findemp = await Employee.findOne({ email });
    if (!Findemp) {
      return res.render("Login", { error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, Findemp.password);
    if (!match) {
      return res.render("Login", { error: "Invalid credentials" });
    }

    const token = jwt.sign({ email: Findemp.email }, SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });

    if (Findemp.email === "admin.page@gmail.com") {
      return res.redirect("/admin");
    }
    return res.redirect(`/profile/${Findemp._id}`);

  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function updateEmployee(req, res) {
  try {
    const employee = await Employee.findById(req.params.id)
    res.render("UpdateEmp", { employee })
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
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
      { username, phone, address, about, imageUrl: imagePath },
      { new: true }
    )
    if (!employee) {
      return res.status(404).send("Employee not found");
    }
    res.redirect(`/profile/${employee._id}`);
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function AdminPage(req, res) {
  try {
    const email = "admin.page@gmail.com";
    let existing = await Employee.findOne({ email });

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

    const employees = await Employee.find({ email: { $ne: "admin.page@gmail.com" } });
    const admin = await Employee.findOne({ email: "admin.page@gmail.com" })
    return res.render("admin", { admin, employees });

  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function employeeView(req, res) {
  try {
    const id = req.params.id
    const emp = await Employee.findById(id)
    const taskData = await Task.find({ assignedTo: id })
    res.render("AdminToEmp", { emp, taskData })
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function updatefromadmin(req, res) {
  const ID = req.params.id
  const { position, salary, status, department } = req.body;
  try {
    const employee = await Employee.findByIdAndUpdate(ID,
      { position, salary, status, department },
      { new: true }
    )
    if (!employee) {
      return res.status(404).send("Employee not found");
    }
    res.redirect(`/admin/emp/${ID}`);
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function deleteemp(req, res) {
  try {
    const id = req.params.id
    await Employee.findByIdAndDelete(id)
    res.redirect("/admin")
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function TaskForm(req, res) {
  try {
    const id = req.params.id
    const emp = await Employee.findById(id)
    res.render("taskForm", { emp })
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function Addtask(req, res) {
  try {
    const { title, description, deadline, status } = req.body
    const empID = req.params.id

    const newTask = new Task({ title, deadline, description, status, assignedTo: empID })
    await newTask.save();
    res.redirect("/admin")
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function updateTask(req, res) {
  try {
    const TasksID = req.params.id
    const { status } = req.body
    await Task.findByIdAndUpdate(TasksID, { status })
    res.redirect(req.get("referer") || "/");
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function DeleteTask(req, res) {
  try {
    const TasksId = req.params.id
    await Task.findByIdAndDelete(TasksId)
    res.redirect(req.get("referer") || "/");
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
  }
}

async function Logout(req, res) {
  try {
    const id = req.params.id
    const employee = await Employee.findById(id)
    if (employee) {
      res.cookie("token", "")
    }
    res.redirect("/login")
  } catch (err) {
    res.status(500).send("Server Issue: " + err.message)
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
  DeleteTask
}
