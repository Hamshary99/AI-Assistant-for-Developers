import { ApiError } from "../utils/errorHandler.js";


export const getUserRequestHistoryApi = async (req) => {
    try {
       

    } catch (error) {
        throw new ApiError(
        error.message || "Failed to retrieve request history",
        error.statusCode || 500
        );
    }
}