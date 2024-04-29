const mongoose = require('mongoose');//mongoose connection setup
const Emp=require("./models/emp.js");//taking the data from chat.js from models directory.
main().then(()=>{
    console.log("mongoose conn sussesful ")
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/employ');
  
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
  }

  let allEmp=[{
    name:"Nishant",
    email:"abc@gmail.com",
    mobile:"6203010399",
    designation:["HR","Manager"],
    gender:"Male",
    course:["MCA","BCA"],
  },
  {
    name:"Ayush",
    email:"cde@gmail.com",
    mobile:"6203010398",
    designation:["HR","Manager"],
    gender:"Male",
    course:["MCA","BCA"],
  }];
 Emp.insertMany(allEmp);
  