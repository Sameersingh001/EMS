import express from "express"
import controller from "../controllers/controller.js"
import {Verify, upload} from "../middleware/middle.js"

const router = express.Router()

router.get("/", controller.homepage)
router.get("/register", controller.showRegister)
router.get("/login", controller.showLogin)
router.get("/profile/:id",Verify, controller.Deshboard )
router.get("/allemployees", Verify, controller.allemp)
router.get("/employees/:id", Verify, controller.employeepage)


router.get("/logout/:id", controller.Logout)
router.get("/profile/update/:id", Verify, controller.updateEmployee)
router.get("/admin", Verify, controller.AdminPage)
router.get("/admin/emp/:id",Verify, controller.employeeView)
router.get("/admin/update/emp/:id", Verify, controller.adminEmpUpdate)
router.get("/delete/:id", controller.deleteemp)


router.post("/admin/update/emp/:id", controller.updatefromadmin)
router.post('/register', upload.single("imageUrl"), controller.Register)
router.post('/login', controller.Login)
router.post("/profile/update/:id", upload.single("imageUrl"), controller.saveUpdateEmp)

export default router