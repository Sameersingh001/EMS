import jwt from "jsonwebtoken";

const SECRET = "Authentication@Login_System"; // moved outside for clarity

 function Verify(req, res, next) {
  const authHeader =  req.headers.cookie;
 
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

export default Verify;