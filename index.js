const express=require("express"); //express connection setup
const app=express();
const mongoose = require('mongoose');
const path=require("path");//ejs connection setup
const Emp=require("./models/emp.js");//taking the data from chat.js from models directory.
const methodOverride=require("method-override");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");



app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));// watever we get the data from some form in any req body we have to parse it so we use this line to parse the following data.
app.use(methodOverride("_method"));
// app.use(passport.initialize());
// app.use(passport.session);
main().then(()=>{
    console.log("mongoose conn sussesful ")
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/employ');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

app.get("/",(req,res)=>{
    res.render("dash.ejs");
});
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser",async(req,res)=>{
// let fakeUser=new User({
//     email:"student@gmail.com",
//     username: "delta-student"
// });

// let registeredUser=await User.register(fakeUser,"helloworld");
// res.send(registeredUser);
// });

app.get("/emps",async(req,res)=>{
    if(!req.isAuthenticated()){
        // req.flash("error","you must be loggedIn");
       return  res.redirect("/login")
    }
    let emps=await Emp.find();
    console.log(emps);
    res.render("index.ejs",{emps});
});

app.get("/emps/new",(req,res)=>{
    if(!req.isAuthenticated()){
       // req.flash("error","you must be loggedIn");
      return  res.redirect("/login")
   }
    res.render("new.ejs",{});
});


//create route
app.post("/emps",(req,res)=>{

    let{name,email,mobile,designation,gender,course,image}=req.body;
    let newEmp=new Emp({
        name:name,
        email:email,
        mobile:mobile,
        designation:designation,
        gender:gender,
        course:course,
        image:image,
    });
    newEmp.save().then((res)=>{
        console.log("chat was saved");
    }).catch((err)=>{
        console.log(err);
    });
    res.redirect("/emps");
});

//edit route
app.get("/emps/:id/edit",async(req,res)=>{
    if(!req.isAuthenticated()){
       // req.flash("error","you must be loggedIn");
      return  res.redirect("/login")
   }
    let{id}=req.params;
    let emp=await Emp.findById(id);
    res.render("edit.ejs",{emp});
});

//update route
app.put("/emps/:id", async (req, res) => {
    if(!req.isAuthenticated()){
        req.flash("error","you must be loggedIn");
      return  res.redirect("/login")
   }
    try {
        const { id } = req.params;

        // Extract update data from req.body
        const { name, email, mobile, designation, gender, course, image } = req.body;

        // Construct the update object
        const updateData = {
            name,
            email,
            mobile,
            designation,
            gender,
            course,
            image
        };

        // Update the employee by ID
        const updatedEmp = await Emp.findByIdAndUpdate(id, updateData, {
            runValidators: true, // Ensure validation rules are applied
            new: true // Return the updated document
        });

        if (!updatedEmp) {
            return res.status(404).send("Employee not found");
        }

        // Redirect to the list of employees
        res.redirect("/emps");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



//delete
app.delete("/emps/:id",async (req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("error","you must be loggedIn");
      return  res.redirect("/login")
   }
    let {id}=req.params;
    let deletedEmp=await Emp.findByIdAndDelete(id);
    console.log(deletedEmp);
    res.redirect("/emps");
    });


     app.get("/signup",(req,res)=>{
        res.render("signup.ejs",{});
     });

     app.post("/signup",async(req,res)=>{
        try{
            let {username,email,password}=req.body;
            const newUser=new User({email,username});
            const registeredUser=await User.register(newUser,password);
            console.log(registeredUser);
            req.flash("success","welcome admin");
            res.redirect("/emps");
        } catch(e){
            req.flash("error",e.message);
            res.redirect("/signup");
        }
        
     });

     app.get("/login",(req,res)=>{
        res.render("login.ejs");
     });

     app.post("/login",
     passport.authenticate('local',
     {failureRedirect:"/login"}),
     async(req,res)=>{
      res.redirect("/");
     });

     app.get("/logout",(req,res,next)=>{
        req.logout((err)=>{
            if(err){
                return next(err);
            }
            res.redirect("/login");
        });
     })


app.listen(3000,()=>{
    console.log("server is listening to port");
});

