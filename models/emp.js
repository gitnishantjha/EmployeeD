const mongoose=require('mongoose');

const empSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    mobile:{
        type:String,
        required:true,
    },
    designation:{
    type:[String],
    required:true,
    },
    gender: {
        type: String, // For radio buttons
        enum: ['Male', 'Female', 'Other'], // Specify the options
        required: true,
      },
      course: {
        type: [String], // Change to array for checkboxes
        required: true,
      },
      image: {
        url:String,
        filename:String,
        // type:String,
        // default:"https://images.unsplash.com/photo-1712403195116-b151afd45625?q=80&w=915&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        // set:(v)=>v===""?"https://images.unsplash.com/photo-1712403195116-b151afd45625?q=80&w=915&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D":v,
      }
});

const Emp=mongoose.model("emp",empSchema);
module.exports=Emp;
