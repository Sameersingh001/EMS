import express from "express"
import controller from "../controllers/controller.js"
import {Verify, upload} from "../middleware/middle.js"

const router = express.Router()

router.get("/", controller.homepage)
router.get("/register", controller.showRegister)
router.get("/login",Verify, controller.showLogin)
router.get("/profile/:id",Verify, controller.Deshboard )
router.get("/allemployees/:id", Verify, controller.allemp)
router.get("/employees/:id", Verify, controller.employeepage)
router.get("/admin/task-form/:id", Verify, controller.TaskForm)
router.get("/profile/complaint/:id", Verify, controller.complaintForm)
router.get("/profile/my-complaints/:id",Verify, controller.showComplaints)
router.get("/admin/all-complaints/:id",Verify, controller.allComplaints)
router.get("/admin/tasks",Verify, controller.assingTasks)



router.get("/profile/update/:id", Verify, controller.updateEmployee)
router.get("/admin", Verify, controller.AdminPage)
router.get("/admin/emp/:id",Verify, controller.employeeView)
router.get("/admin/update/emp/:id", Verify, controller.adminEmpUpdate)
router.get("/admin/filter", Verify, controller.complaintFilter)
router.get("/admin/emp",Verify, controller.filterByname)
router.get("/:id/emp/search",Verify, controller.SearchByname)
router.get("/admin/notice/:id", Verify, controller.noticeForm)

router.get("/logout/:id", controller.Logout)
router.get("/delete/:id", controller.deleteemp)

router.post("/admin/complaints/delete/:id", controller.deleteComplaint)
router.post("/admin/complaints/update/:id", controller.updateComplaint)


router.post("/notice/add", controller.noticeAdded)
router.post("/admin/assigned-tasks", controller.tasksAssinged)
router.post("/profile/complaint/:id",controller.raisedComplaint)
router.post("/admin/update/emp/:id", controller.updatefromadmin)
router.post('/register', upload.single("imageUrl"), controller.Register)
router.post('/login', controller.Login)
router.post("/profile/update/:id", upload.single("imageUrl"), controller.saveUpdateEmp)
router.post("/admin/task/add/:id",controller.Addtask)
router.post("/task/update/:id", controller.updateTask)
router.post("/task/delete/:id", controller.DeleteTask)



export default router