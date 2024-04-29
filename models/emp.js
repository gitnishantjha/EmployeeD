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
        url: String,
        filename: String,
      },
});

const Emp=mongoose.model("emp",empSchema);
module.exports=Emp;
