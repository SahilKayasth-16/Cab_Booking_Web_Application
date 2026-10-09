import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";

export type Role = "rider" | "driver";

export function requireAuthApi(req: Request, res: Response, next: NextFunction) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}

export function requireRole(...roles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { userId, sessionClaims } = getAuth(req);
        
        if (!userId) {
             return res.status(401).json({ error: "Unauthorized" });
        }

        const role = (sessionClaims?.metadata as { role?: Role } | undefined)?.role;

        if (!role || !roles.includes(role)) {
            return res.status(403).json({ error: "Forbidden: wrong role"});
        }
        next();
    };
}