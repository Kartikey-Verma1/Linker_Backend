const validator = require("validator");
const createError = require("./createError");

const validateInputData = (req)=>{
    const {firstName, lastName, email, password, age, gender, about, skills, photourl} = req.body;
    if(firstName && (firstName.length < 4 || firstName.length > 15)){
        throw createError(423, "Firstname length should be between 4 to 15...");
    }
    if(lastName && (lastName.length < 4 || lastName.length > 15)){
        throw createError(423, "Lastname length should be between 4 to 15...");
    }
    if(email){
        if(!validator.isEmail(email)) throw createError(423, "Enter valid email!");
    }
    if(password){
        if(!validator.isStrongPassword(password)){
            throw createError(423, `Password must include 1 capital case, 1 small case, 1 special character, 1 number and minimum length of 8!`);
        }
    }
    if(age){
        if(age < 16) throw createError(423, "You are underage!");
        if(age > 70) throw createError(423, "You are overage!");
    }
    if(gender){
        if(!["male", "female", "others", null].includes(gender)) throw createError(423, "Enter valid gender");
    }
    if(about && about.length > 200){
        throw createError(423, "Max limit of about section is 200!");
    }
    if(skills){
        if(skills.length > 20){
            throw createError(423, "Maximum number of skills allowed is 20");
        } else {
            skills.forEach(element => {
                if(element.length > 20) throw createError(423, "Length of skill cannot be more than 20");
            });
        }
    }
    if(photourl){
        if(!validator.isURL(photourl)) throw createError(423, "Enter valid url!");
    }
};

const validateEditData = (req)=>{
    const editDataList = ["firstName", "lastName", "age", "gender", "about", "skills", "photourl"];
    const isEditAllowed = Object.keys(req.body).every((field)=> editDataList.includes(field));

    if(!isEditAllowed) throw createError(409, "Edit not allowed!");
};
module.exports = {validateInputData, validateEditData};