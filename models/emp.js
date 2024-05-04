const mongoose = require('mongoose');

// Function to format date as "dd-Mon-yy"
const formatDate = () => {
    const date = new Date();
    const options = { year: '2-digit', month: 'short', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('en-GB', options);
    return formattedDate.replace(/ /g, '-');
};

const empSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    designation: {
        type: [String],
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    course: {
        type: [String],
        required: true,
    },
    image: {
        url: String,
        filename: String,
    },
    createdAt: {
        type: String,
        default: formatDate // Set default value to formatted date
    }
});

const Emp = mongoose.model("emp", empSchema);
module.exports = Emp;
