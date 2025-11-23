const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required:true,
        minLength:5,
        maxLength: 50
    },
    lastName: {
        type: String,
        required:true
    },
    emailId: {
        type: String,
        lowercase:true,
        required:true, 
        unique: true,
        trim:true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid email address.");
            }
        }
    },
    password: {
        type: String,
        required:true,
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Enter the strong password.");
            }
        }
    },
    age: {
        type: Number,
        min:18,
        validate(value) {
            if(!validator.isNumeric(value)) {
                throw new Error("Enter the number.");
            }
        }
    },
    gender: {
        type: String,
        enum:{
            values: ["male", "female", "others"],
            message:`Gender takes only male, female and others`
        }
        // validate(value) {
        //     if(!["male", "female", "others"].includes(value)){
        //         throw new Error("Gender data not valid");
        //     }
        // }
    },
    photoUrl: {
        type: String,
        default: "https://thumbs.dreamstime.com/z/picture-profile-icon-human-people-sign-symbol-template-design-picture-profile-icon-human-people-sign-symbol-126138165.jpg",
        validate(value) {
            if(!validator.isURL(value)) {
                throw new Error("Invalid photoUrl.");
            }
        }
    },
    about: {
        type: String,

    },
    skills: {
        type:[String]
    }
},
{
    timestamps: true,
}
);


userSchema.index({
    firstName:1,
    lastName: 1
})

userSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign({_id:user._id}, "DEV@Tinder$148",{
        expiresIn: "1d"
    });
    return token
}

userSchema.methods.validatePassword = async function (passwordInutByUser) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(
        passwordInutByUser,
        passwordHash
    );
    return isPasswordValid;
}


module.exports = mongoose.model("User", userSchema);