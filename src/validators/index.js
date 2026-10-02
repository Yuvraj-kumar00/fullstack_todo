import { body, param } from "express-validator";

const userRegistrationValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty().withMessage("Name is required")
            .isLength({ min: 3 }).withMessage("username should be at least 3 character")
            .isLength({ max: 13 }).withMessage("name cannot exceed 13 character"),
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),
        body("password")
            .trim()
            .notEmpty().withMessage("Password can not be empty")
            .isLength({ min: 8 }).withMessage("Password should be at least 8 character")
            .isLength({ max: 14 }).withMessage("Password cannot exceed 14 character")
    ]
}

const userLoginValidator = () => {
    return [
        body("email")
            .isEmail().withMessage("Email is invalid"),
        body("password")
            .notEmpty().withMessage("Password is required")
    ]
}

const verificationTokenValidator = () => {
    return [
        param("token")
        .trim()
        .notEmpty().withMessage("Verification token is required")
    ]
}

const todoCreationValidation = () => {
    return [
        body("description")
            .trim()
            .notEmpty().withMessage("Description is required")
    ]
}

export {userRegistrationValidator, userLoginValidator, verificationTokenValidator, todoCreationValidation}