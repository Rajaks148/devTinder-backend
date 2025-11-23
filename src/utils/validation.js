
const validator = require("validator");


const validateSignup = (req) => {
    const { firstName, lastName, emailId, password } = req.body;
    if(!firstName || !lastName) {
        throw new Error("Name is not valid!");
    } else if(!validator.isEmail(emailId)) {
        throw new Error("Email is not valid!");
    } else if(!validator.isStrongPassword(password)) {
        throw new Error("Please enter the strong password!");
    }
};

const validateEditProfileData = (req) => {
    const allowedFields = [ 
            "photoUrl",
            "skills", 
            "about",
            "gender",
            "age"
        ];

    const isEditAllowed = Object.keys(updateData).every(k => allowedFields.includes(k));    

    return isEditAllowed;    

 

};

module.exports = {
    validateSignup,
    validateEditProfileData
}
