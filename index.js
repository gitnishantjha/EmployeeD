if(process.env.Node_ENV!="production"){
    require("dotenv").config();
}
require('dotenv').config();
console.log(process.env.SECRET);
const express=require("express"); //express connection setup
const app=express();
const mongoose = require('mongoose');
const path=require("path");//ejs connection setup
const Emp=require("./models/emp.js");//taking the data from employee from models directory.
// const User=require("./models/user.js");
const methodOverride=require("method-override");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const ExpressError=require("./utils/ExpressError.js");
const multer  = require('multer');
const {storage}=require("./cloudConfig")
const upload = multer({storage});

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
  await mongoose.connect('mongodb://127.0.0.1:27017/empData');
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

// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"page not found"));
// });

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
});

app.get("/",async(req,res,next)=>{
    if(!req.isAuthenticated()){
       return  res.redirect("/login");
    }
    let user = await User.findById(req.user.id); 
   
    // console.log("loggedIn");
    res.render("dash.ejs",{user});
});

// app.get("/register",(req,res)=>{
//     let{name="anonymous"}=req.query;
//     req.session.name=name;
//     if(name==="anonymous"){
//         req.flash("error","user not registered");
//     }else{
//         req.flash("success","you are loggedIn");
//     }
//     res.redirect("/hello");
//   });

//   app.get("/hello", (req,res)=>{
//    // console.log(req.flash("success"));
//     res.render("page.ejs",{name:req.session.name});
//   });



//index Route
app.get("/emps",async(req,res)=>{
    if(!req.isAuthenticated()){
        // req.flash("error","you must be loggedIn");
       return  res.redirect("/login")
    }
    let emps=await Emp.find();
    let user = await User.findById(req.user.id); 
    // let user=await User.find();
    // console.log(emps);
    // req.flash("success","successfully added");
    res.render("index.ejs",{emps,user});
});



app.get("/emps/new",async(req,res)=>{
    if(!req.isAuthenticated()){
       // req.flash("error","you must be loggedIn");
      return  res.redirect("/login");
   }
   let user = await User.findById(req.user.id); 
    res.render("new.ejs",{user});
});



//counting employee
app.get('/emps/count', async (req, res) => {
    try {
        // Get the count of documents in the collection
        const totalEmployees = await Emp.countDocuments();

        // Send the total count as JSON response
        res.json({ totalEmployees });
    } catch (error) {
        console.error('Error fetching total employees count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



//create route
app.post("/emps",upload.single('image_url'),async(req,res)=>{
     let url=req.file.path;
     let filename=req.file.filename;
     console.log(url,"...",filename);
     const existingEmployee = await Emp.findOne({ email: req.body.email });

     if (existingEmployee) {
         // If email already exists, render the form again with an error message
         return res.render('new', { error: 'Email already in use', user: req.user });
     }
 
    let{name,email,mobile,designation,gender,course}=req.body;
    let image={url,filename};
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
   let user = await User.findById(req.user.id); 
    let{id}=req.params;
    let emp=await Emp.findById(id);
    res.render("edit.ejs",{emp,user});
});

//update route
app.put("/emps/:id", upload.single('image_url'), async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "you must be loggedIn");
        return res.redirect("/login");
    }
    try {
        const { id } = req.params;

        // Extract update data from req.body
        const { name, email, mobile, designation, gender, course } = req.body;

        // Construct the update object
        let updateData = {
            name,
            email,
            mobile,
            designation,
            gender,
            course,
        };

        // Check if a file is uploaded
        if (typeof req.file!=="undefined") {
            const url = req.file.path;
            const filename = req.file.filename;
            updateData.image = { url, filename };
        }

        // Update the employee by ID
        const updatedEmp = await Emp.findByIdAndUpdate(id, updateData, {
            runValidators: true, // Ensure validation rules are applied
            new: true // Return the updated document
        });

        if (!updatedEmp) {
            return res.status(404).send("Employee not found");
        }

        // Redirect to the list of employees
        req.flash("success","Employee details successfully updated");
        res.redirect("/emps");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// app.put("/emps/:id",upload.single('image_url'), async (req, res) => {
//     if(!req.isAuthenticated()){
//         req.flash("error","you must be loggedIn");
//       return  res.redirect("/login")
//    }
//     try {
//         const { id } = req.params;

    
//         let url=req.file.path;
//         let filename=req.file.filename;
//         let image={url,filename};

//         console.log(url,"....",filename);
//         // Extract update data from req.body
//         const { name, email, mobile, designation, gender, course} = req.body;

//         // Construct the update object
//         const updateData = {
//             name,
//             email,
//             mobile,
//             designation,
//             gender,
//             course,
//             image
//         };

//         // Update the employee by ID
//         const updatedEmp = await Emp.findByIdAndUpdate(id, updateData, {
//             runValidators: true, // Ensure validation rules are applied
//             new: true // Return the updated document
//         });

//         if (!updatedEmp) {
//             return res.status(404).send("Employee not found");
//         }

//         // Redirect to the list of employees
//         res.redirect("/emps");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// });



//delete
app.delete("/emps/:id",async (req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("error","you must be loggedIn");
      return  res.redirect("/login")
   }
    let {id}=req.params;
    let deletedEmp=await Emp.findByIdAndDelete(id);
    req.flash("success","Employee deleted Successfully");
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
            req.flash("success","successfully SignedUp");
            res.redirect("/login");
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
        req.flash("success","you are loggedIn");
      res.redirect("/");
     });

     app.get("/logout",(req,res,next)=>{
        req.logout((err)=>{
            if(err){
                return next(err);
            }
            res.redirect("/login");
        });
     });


    //  app.get("/emps/search", async (req, res) => {
    //     try {
    //         const query = req.query.query; // Get the search query from the URL parameter
    
    //         // Fetch employee data that matches the search query based on the username field
    //         const emps = await Emp.find({ username: { $regex: new RegExp(query, 'i') } });
    
    //         res.render("search-results.ejs", { emps, query }); // Render search results template with filtered data
    //     } catch (error) {
    //         console.error('Error searching employees:', error);
    //         res.status(500).send('Internal Server Error');
    //     }
    // });

    // app.get("/emps/search", async (req, res) => {
    //     try {
    //         const query = req.query.query;
    //         let user = await User.findById(req.user.id); 
    //         const emps = await Emp.find({ name: { $regex: new RegExp(query, "i") } }); // Case-insensitive search by name
    //         res.render("search.ejs", { emps,user,query });
    //     } catch (error) {
    //         console.error('Error searching employees:', error);
    //         res.status(500).send('Internal Server Error');
    //     }
    // });
    app.get('/emps/search', async (req, res) => {
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in");
            return res.redirect("/login");
        }
    
        const query = req.query.query;
        let user = await User.findById(req.user.id);
        try {
            let filteredEmps;
            if (query) {
                // Search for employees by name or email based on the query
                filteredEmps = await Emp.find({
                    $or: [
                        { name: { $regex: new RegExp(query, "i") } },
                        { email: { $regex: new RegExp(query, "i") } }
                    ]
                });
                // Render the filtered employees as HTML
                res.render('search', { filteredEmps, user });
            } else {
                // If no query, return all employees
                const allEmps = await Emp.find();
                res.render('search', { filteredEmps: allEmps, user });
            }
        } catch (error) {
            console.error('Error fetching filtered employees:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
app.listen(3000,()=>{
    console.log("server is listening to port");
});

