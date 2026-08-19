const express = require("express");
const Router = express.Router;
const bcrypt = require("bcrypt");

const { AdminModel } = require("../db");
const { AdminMiddleware, addRevokedToken } = require("../middlewares/auth");
const { z } = require("zod");

const { JWT_ADMIN_SECRET } = require("../config");
const jwt = require("jsonwebtoken");

const AdminRouter = Router();

AdminRouter.post(["/signup", "/signup/"], async (req, res) => {
    const CheckAdminInput = z.object({
        email: z.string().email().min(5).max(100),
        username: z.string().min(3).max(100),
        password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        first_name: z.string().min(2).max(50),
        last_name: z.string().min(3).max(50)
    });

    const { email, username, password, first_name, last_name } = req.body;

    const validZod = CheckAdminInput.safeParse({
        email, username, password, first_name, last_name
    });

    if (!validZod.success) {
        const errorMessage = validZod.error.issues.map(issue => issue.message).join(", ");
        console.log("An error has occured. The error is: " + errorMessage);
        res.status(400).json({
            error: `An error has occured. The error is: ${errorMessage}`
        });
    } else {
        const hashPassword = bcrypt.hashSync(password, 10);

        try {
            await AdminModel.create({
                email,
                username,
                password: hashPassword,
                first_name,
                last_name
            });
        } catch (err) {
            console.log("An error occured: " + err);
            res.status(400).json({
                error: `The error occured is ${err}`
            });
            return;
        }

        res.json({
            message: "You have signed up as a admin!"
        });
    }
});

AdminRouter.post(["/login", "/login/"], async (req, res) => {
    const checkAdminEntry = z.object({
        username: z.string().min(3).max(100),
        password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    });

    const { username, password } = req.body;

    const AdminIsCorrect = checkAdminEntry.safeParse({
        username, password
    });

    if (!AdminIsCorrect.success) {
        const errorMessage = AdminIsCorrect.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({
            error: `An error has occurred. The error is: ${errorMessage}`
        });
    }

    const IsAdminValid = await AdminModel.findOne({
        username
    });

    if (!IsAdminValid) {
        res.status(403).json({
            error: `The username did not match`
        });
        return;
    }

    const isCorrect = await bcrypt.compare(password, IsAdminValid.password);

    if (!isCorrect) {
        res.status(403).json({
            error: `An error has occurred. The password did not match`
        });
        return;
    } else {
        const token = jwt.sign({
            id: IsAdminValid._id
        }, JWT_ADMIN_SECRET);
        // cookie logic can be even used
        res.json({
            message: "You have successfully logged in as a Admin!",
            token: token
        });
    }
});

// AI data train endpoint for admin to trigger/view training from Python FastAPI service
AdminRouter.post("/ai-data-train/", AdminMiddleware, async (req, res) => {
    try {
        const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
        const { source, custom_system_instructions, training_examples, persist_training } = req.body;

        const response = await fetch(`${pythonApiUrl}/api/v1/ai/admin-train`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                source: source || "database",
                custom_system_instructions,
                training_examples: training_examples || [],
                persist_training: persist_training !== false
            })
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        console.log("Error connecting to AI service: " + err);
        res.status(500).json({
            error: `Failed to trigger AI training: ${err.message}`
        });
    }
});

AdminRouter.get("/ai-status/", AdminMiddleware, async (req, res) => {
    try {
        const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
        const response = await fetch(`${pythonApiUrl}/api/v1/ai/status`);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        console.log("Error fetching AI status: " + err);
        res.status(500).json({
            error: `Failed to fetch AI status: ${err.message}`
        });
    }
});

// Logout route for admins
AdminRouter.post("/logout/", AdminMiddleware, (req, res) => {
    addRevokedToken(req.token);
    res.json({
        message: "You have successfully logged out as an admin!"
    });
});

module.exports = {
    AdminRouter
}