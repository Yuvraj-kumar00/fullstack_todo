import { ApiResponse } from "../utils/api-response.js";

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!allowedRoles.includes(req.user.role)) {
            return res.status(403).json(new ApiResponse(403, "Access denied"));
        }

        next();
    }
}

export default authorizeRoles;