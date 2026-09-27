let express = require("express")
let app = express()
let cors = require("cors")
let mongoose = require("mongoose")
let bcryptjs = require("bcryptjs")
let User = require("./db.js")
let jwt=require("jsonwebtoken")
let crypto = require("crypto")
//let { sendEmail } = require("./sendEmail.js")



app.use(express.json())
app.use(cors())



mongoose.connect("mongodb://127.0.0.1:27017/db")
  .then(() => {
    console.log("db connected")
  })
  .catch((err) => {
    console.log(err)
  })



// signup
app.post("/signUp",async (req, res) => {
try{
  let { name, email, passWord ,role} = req.body
  let findData= await User.findOne({ email })

  if (findData) {
    return res.send("user already exists")
  }
  let updatedP = await bcryptjs.hash(passWord, 10);

  let userData = new User({
    name,
    email,
    passWord: updatedP,
    role:role||"user"
  })
  await userData.save()
  res.send("signup successful")
}catch(err){
  console.log(err);
  res.send("Error occurred in sign-up");
}
})



//login
app.post("/login",async (req, res) => {

  let { email, passWord } = req.body

  let findData = await User.findOne({ email })

  if (!findData) {
    return res.send("user not found");
  }

  let validP = await bcryptjs.compare(
    passWord,
    findData.passWord
  );

  if (!validP) {
    return res.send("password incorrect")
  }
  let token = jwt.sign(
    {
      email: findData.email,
      role: findData.role
    },
    "secretkey"
  )
  res.send({
    messeag: "login successful",
    token: token
  })
})



let auth = (req, res, next) => {
  let token = req.headers.authorization;
  console.log(token,"tokennnn")

  if (!token) {
    return res.send("kaun hai aapppp")
  }
  let decode=jwt.verify(token, "secretkey")
  console.log(decode,"isseee");
  req.user=decode
  next()
}

let roleCheck = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.send("Access denied")
    }
    next()
  }
}

app.get("/api", auth, roleCheck("admin"), (req, res) => {
  res.send("protected route")
})



app.post("/forgot-password",async (req,res)=>{

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send('User not found');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `http://localhost:5713/reset-password/${resetToken}`;
    await sendEmail(
      user.email,
      'Password Reset Request',
      `Click the link below to reset your password:\n\n${resetUrl}`
    );

    res.send('Password reset email sent');
  } catch (error) {
    res.send('Error sending password reset email: ' + error.message);
  }
})




app.post("/reset-password/:token", async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.params;
    let user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
      if (!user) {
        return res.send('Invalid user or expired token');
      }

      user.passWord = await bcryptjs.hash(newPassword, 10);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.send('Password reset successful');
  });


  app.get("/handle-error",(req,res) => {
    try {
      let userrr=null;
      console.log(userrr.name);
      console.log("hiiieeee");
      console.log("heellloooooo");
      res.send("no error")
    }catch(err){
      console.log("Error occurred",err);
      res.send("Error occurred");
    }
  })




app.get("/users", async (req, res) => {
  let users = await User.find()
  res.send(users)
})  



app.listen(3000, () => {
  console.log("server running on port 3000")
})