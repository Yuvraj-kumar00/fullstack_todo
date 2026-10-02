import {validationResult} from "express-validator";
import { ApiError } from "../utils/api-error.js";


export const validate = (req, res, next) => {
    const errors = validationResult(req);
    console.log("Validator errors hhi: ", errors);

    if(errors.isEmpty()) {
        console.log("error empty");
        return next();
    }

    const extractedError = [];
    errors.array().map((err) => 
        extractedError.push({
            [err.path]: err.msg,
        }),
    );
    console.log(extractedError);
    
    throw new ApiError(422, "Recieved data is not valid", extractedError);
};