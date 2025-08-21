import jwt from "jsonwebtoken";
import multer, { diskStorage } from "multer";
import path from "path"

const SECRET = "Authentication@Login_System"; // moved outside for clarity

// JWT Verify middleware
export function Verify(req, res, next) {
  const authHeader = req.headers.cookie;
  const token = authHeader?.split("=")[1]; // optional chaining

  if (!token) {
    return res.render("Login");
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.render("Login");
  }
}

  const uploadedpath = path.join(process.cwd(), "uploads")

// Multer storage config
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadedpath);
  },
  filename: (req, file, cb) => {
    const uniquePath = Date.now() + "-" + file.originalname; // ✅ fixed `file` not `req.file`
    cb(null, file.fieldname + "-" + uniquePath);
    
  }
});

// Multer upload instance
export const upload = multer({ storage });
