import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // If the status code is still 200, it means it's an unhandled server error (500)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
