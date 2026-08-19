const jwt = require("jsonwebtoken");

const { JWT_USER_SECRET, JWT_DOCTOR_SECRET, JWT_ADMIN_SECRET } = require("../config");

const revokedTokens = new Set();

function getTokenFromHeader(req) {
    const authHeader = req.headers.authorization || req.headers.token;

    if (!authHeader) {
        return null;
    }

    return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
}

function addRevokedToken(token) {
    if (token) {
        revokedTokens.add(token);
    }
}

function isTokenRevoked(token) {
    return revokedTokens.has(token);
}

function UserMiddleware(req, res, next) {
    const token = getTokenFromHeader(req);

    if (!token) {
        return res.status(403).json({
            error: "No token provided"
        });
    }

    if (isTokenRevoked(token)) {
        return res.status(401).json({
            error: "Token revoked. Please log in again."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_USER_SECRET);
        req.userId = decoded.id;
        req.token = token;
        next();
    } catch (err) {
        return res.status(403).json({
            error: "Invalid or expired token"
        });
    }
}

function AdminMiddleware(req, res, next) {
    const token = getTokenFromHeader(req);

    if (!token) {
        return res.status(403).json({
            error: "No token provided"
        });
    }

    if (isTokenRevoked(token)) {
        return res.status(401).json({
            error: "Token revoked. Please log in again."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_ADMIN_SECRET);
        req.adminId = decoded.id;
        req.token = token;
        next();
    } catch (err) {
        return res.status(403).json({
            error: "Invalid or expired token"
        });
    }
}

function DoctorMiddleware(req, res, next) {
    const token = getTokenFromHeader(req);

    if (!token) {
        return res.status(403).json({
            error: "No token provided"
        });
    }

    if (isTokenRevoked(token)) {
        return res.status(401).json({
            error: "Token revoked. Please log in again."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_DOCTOR_SECRET);
        req.doctorId = decoded.id;
        req.token = token;
        next();
    } catch (err) {
        return res.status(403).json({
            error: "Invalid or expired token"
        });
    }
}

module.exports = {
    UserMiddleware,
    AdminMiddleware,
    DoctorMiddleware,
    addRevokedToken,
    isTokenRevoked
};