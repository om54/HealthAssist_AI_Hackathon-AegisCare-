const express = require("express");
const Router = express.Router;
const bcrypt = require("bcrypt");

const { z } = require("zod");

const UsersRouter = Router();
const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET } = require("../config");

const { UserModel, MemberModel, UserProblemModel, TypeOfProblemModel, ProblemSolutionByDoctorModel, DoctorModel, UserAppointmentWithDoctorModel } = require("../db");
const { UserMiddleware, addRevokedToken } = require("../middlewares/auth");

// Signup route for users
UsersRouter.post(["/signup", "/signup/"], async (req, res) => {
    const CheckUserInput = z.object({
        email: z.string().email().min(5).max(100),
        username: z.string().min(3).max(100),
        password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        location: z.string().max(400),
        city: z.string().min(2).max(50),
        pin_code: z.number().positive().int().min(100000).max(999999)
    });

    const { email, username, password, location, city, pin_code } = req.body;

    const validZod = CheckUserInput.safeParse({
        email, username, password, location, city, pin_code
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
            await UserModel.create({
                email,
                username,
                password: hashPassword,
                location,
                city,
                pin_code
            });
        } catch (err) {
            console.log("An error occured: " + err);
            res.status(400).json({
                error: `The error occured is ${err}`
            });
            return;
        }

        res.json({
            message: "You have signed up as a user!"
        });
    }
});

// Login route for users
UsersRouter.post(["/login", "/login/"], async (req, res) => {
    const checkUserEntry = z.object({
        username: z.string().min(3).max(100),
        password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    });

    const { username, password } = req.body;

    const UserIsCorrect = checkUserEntry.safeParse({
        username, password
    });

    if (!UserIsCorrect.success) {
        const errorMessage = UserIsCorrect.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({
            error: `An error has occurred. The error is: ${errorMessage}`
        });
    }

    const IsUserValid = await UserModel.findOne({
        username
    });

    if (!IsUserValid) {
        res.status(403).json({
            error: `The username did not match`
        });
        return;
    }

    const isCorrect = await bcrypt.compare(password, IsUserValid.password);

    if (!isCorrect) {
        res.status(403).json({
            error: `An error has occurred. The password did not match`
        });
        return;
    } else {
        const token = jwt.sign({
            id: IsUserValid._id
        }, JWT_USER_SECRET);
        // cookie logic can be even used
        res.json({
            message: "You have successfully logged in as a user!",
            token: token
        });
    }
});

UsersRouter.post(["/update-password", "/update-password/"], async (req, res) => {
    const PasswordUpdateInput = z.object({
        username: z.string().min(3).max(100),
        current_password: z.string().min(6).max(100),
        new_password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    });

    const { username, current_password, new_password } = req.body;
    const validEntry = PasswordUpdateInput.safeParse({ username, current_password, new_password });

    if (!validEntry.success) {
        const errorMessage = validEntry.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({
            error: `An error has occurred. The error is: ${errorMessage}`
        });
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
        return res.status(404).json({
            error: "The username did not match"
        });
    }

    const isCorrect = await bcrypt.compare(current_password, user.password);
    if (!isCorrect) {
        return res.status(403).json({
            error: "Current password did not match"
        });
    }

    user.password = bcrypt.hashSync(new_password, 10);
    await user.save();

    res.json({
        message: "Password updated successfully. Please sign in with your new password."
    });
});

UsersRouter.post(["/forgot-password", "/forgot-password/"], async (req, res) => {
    const ForgotPasswordInput = z.object({
        username: z.string().min(3).max(100),
        email: z.string().email().min(5).max(100),
        new_password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    });

    const { username, email, new_password } = req.body;
    const validEntry = ForgotPasswordInput.safeParse({ username, email, new_password });

    if (!validEntry.success) {
        const errorMessage = validEntry.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({
            error: `An error has occurred. The error is: ${errorMessage}`
        });
    }

    const user = await UserModel.findOne({ username, email });
    if (!user) {
        return res.status(404).json({
            error: "No patient account matched that username and email."
        });
    }

    user.password = bcrypt.hashSync(new_password, 10);
    await user.save();

    res.json({
        message: "Password reset successfully. Please sign in with your new password."
    });
});

// Route for logout
UsersRouter.post("/logout/", UserMiddleware, (req, res) => {
    addRevokedToken(req.token);
    res.json({
        message: "You have successfully logged out as a user!"
    });
});

// Route to add a new family member for a user
UsersRouter.post("/add-family-member/", UserMiddleware, async (req, res) => {
    const CheckEntry = z.object({
        first_name: z.string().min(2).max(100),
        last_name: z.string().min(2).max(100),
        date_of_birth: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid date format"),
    });

    const { first_name, last_name, date_of_birth } = req.body;
    const user = req.userId;

    const validEntry = CheckEntry.safeParse({
        first_name, last_name, date_of_birth
    });

    if (!validEntry.success) {
        const errorMessage = validEntry.error.issues.map(issue => issue.message).join(", ");
        res.status(400).json({
            error: errorMessage
        });
        return;
    }

    try {
        // Create the family member
        const member = await MemberModel.create({
            username: user,
            first_name,
            last_name,
            date_of_birth: new Date(date_of_birth)
        });

        res.json({
            message: "Family member added successfully!",
            member_id: member._id
        });
    } catch (err) {
        console.log("An error occurred: " + err);
        res.status(500).json({
            error: `Error creating family member: ${err.message}`
        });
    }
});

// Route to get all family members for a user
UsersRouter.get("/all-family-members/", UserMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const familyMembers = await MemberModel.find({ username: userId });
        res.json({
            familyMembers
        });
    } catch (err) {
        console.log("An error occurred: " + err);
        res.status(500).json({
            error: `The error is ${err}`
        });
    }
});

// Route to report a new problem for a user
UsersRouter.post(["/new-problem/", "/new-problem/:_id"], UserMiddleware, async (req, res) => {
    const CheckEntry = z.object({
        problem: z.string().min(5).max(100),
        description: z.string().min(10).max(400),
        type: z.string().min(2).max(100),
        family_member_id: z.string().optional()
    });

    const { problem, description, type, family_member_id } = req.body;
    const user = req.userId;
    const familyMemberId = family_member_id && family_member_id.trim() ? family_member_id.trim() : null;

    const validEntry = CheckEntry.safeParse({
        problem, description, type, family_member_id: familyMemberId || undefined
    });

    if (!validEntry.success) {
        const errorMessage = validEntry.error.issues.map(issue => issue.message).join(", ");
        res.status(400).json({
            error: errorMessage
        });
        return;
    }

    try {
        if (familyMemberId) {
            const familyMember = await MemberModel.findOne({
                _id: familyMemberId,
                username: user
            });

            if (!familyMember) {
                return res.status(400).json({
                    error: "Invalid family member selected for this user."
                });
            }
        }

        // Find or create the problem type
        let problemType = await TypeOfProblemModel.findOne({ name: type });

        if (!problemType) {
            problemType = await TypeOfProblemModel.create({
                name: type,
                description: description
            });
        }

        // Create the user problem with the type linked
        const userProblem = await UserProblemModel.create({
            user,
            name: familyMemberId,
            problem,
            description,
            type: problemType._id
        });

        res.json({
            message: "Problem reported successfully!",
            problem_id: userProblem._id,
            type_id: problemType._id
        });
    } catch (err) {
        console.log("An error occurred: " + err);
        res.status(500).json({
            error: `Error creating problem: ${err.message}`
        });
    }
});

// Route for AI-powered health problem analysis and specialist triage - automatically posts problem to DB for doctor review
UsersRouter.post("/ai-analyze-health/", UserMiddleware, async (req, res) => {
    try {
        const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
        const { symptoms, age, gender, medical_history, duration, preferred_specialist, family_member_id, save_to_db } = req.body;
        const user = req.userId;

        // Check if user has at least one family member registered
        const existingMembers = await MemberModel.find({ username: user });
        if (!existingMembers || existingMembers.length === 0) {
            return res.status(403).json({
                error: "Access Denied: Live AI Health Assessment is only available when you have added at least one family member to your account. Please add a family member in your dashboard first."
            });
        }

        if (!symptoms || symptoms.trim().length < 5) {
            return res.status(400).json({
                error: "Please describe your symptoms in at least 5 characters."
            });
        }

        const response = await fetch(`${pythonApiUrl}/api/v1/ai/analyze-problem`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                symptoms,
                age,
                gender,
                medical_history,
                duration,
                preferred_specialist
            })
        });

        const aiData = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(aiData);
        }

        // Post problem with AI analysis to database
        let savedProblem = null;
        if (save_to_db !== false) {
            const familyMemberId = family_member_id && family_member_id.trim() ? family_member_id.trim() : null;

            // Find or create problem type
            const typeName = aiData.recommended_specialist || "General Health";
            let problemType = await TypeOfProblemModel.findOne({ name: typeName });
            if (!problemType) {
                problemType = await TypeOfProblemModel.create({
                    name: typeName,
                    description: `Health concerns related to ${typeName}`
                });
            }

            savedProblem = await UserProblemModel.create({
                user,
                name: familyMemberId,
                problem: symptoms.length > 80 ? symptoms.slice(0, 80) + "..." : symptoms,
                description: symptoms,
                type: problemType._id,
                ai_analysis: {
                    recommended_specialist: aiData.recommended_specialist,
                    all_possible_specialists: aiData.all_possible_specialists || [],
                    possible_conditions: aiData.possible_conditions || [],
                    triage_urgency: aiData.triage_urgency,
                    analysis_summary: aiData.analysis_summary,
                    suggested_questions_for_doctor: aiData.suggested_questions_for_doctor || [],
                    general_health_advice: aiData.general_health_advice || [],
                    disclaimer: aiData.disclaimer
                },
                status: "pending_doctor_review"
            });
        }

        res.json({
            ...aiData,
            problem_id: savedProblem ? savedProblem._id : undefined,
            status: savedProblem ? savedProblem.status : undefined,
            message: "AI analysis completed and queued for doctor validation!"
        });
    } catch (err) {
        console.log("Error analyzing health problem with AI: " + err);
        res.status(500).json({
            error: `AI analysis service error: ${err.message}`
        });
    }
});

// Route to get all problems reported by a user along with solutions provided by doctors
UsersRouter.get(["/all-problems/", "/all-problems/:_id"], UserMiddleware, async (req, res) => {
    const userId = req.userId || req.params._id;

    if (!userId) {
        return res.status(400).json({
            error: "User id is required"
        });
    }

    try {
        const userProblems = await UserProblemModel.find({ user: userId })
            .populate("type", "name description")
            .populate("name", "first_name last_name date_of_birth");

        const problemIds = userProblems.map(x => x._id);
        const solutions = await ProblemSolutionByDoctorModel.find({
            user_problem: { $in: problemIds }
        }).populate("doctor", "first_name last_name specialization mbbs_code");

        res.json({
            userProblems,
            solutions
        });
    } catch (err) {
        console.log("An error occurred: " + err);
        res.status(500).json({
            error: `The error is ${err}`
        });
    }
});

// Check for the doctors near me with the same pin code or same city
UsersRouter.get("/doctors-near-me/", UserMiddleware, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).select("pin_code city");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const doctors = await DoctorModel.find({
            $or: [
                { pin_code: user.pin_code },
                { city: user.city }
            ]
        }).lean();

        const uniqueDoctors = [...new Map(
            doctors.map(doc => [String(doc._id), doc])
        ).values()];

        res.json({
            doctors: uniqueDoctors
        });
    } catch (err) {
        console.log("An error occurred:", err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Router where the user gets his appointment with the doctor he wants
UsersRouter.post("/new-appointment/:_doctorId/:_problemId", UserMiddleware, async (req, res) => {
    const user = req.userId;
    const doctor = req.params._doctorId;
    const problem = req.params._problemId;

    const ValidEntry = z.object({
        appointment_date: z.string().optional(),
        appointment_time: z.string().min(4).max(5)
    });

    const { appointment_date, appointment_time } = req.body;

    const isValidEntry = ValidEntry.safeParse({
        appointment_date, appointment_time
    });
    if (!isValidEntry.success) {
        const errorMessage = isValidEntry.error.issues.map(issue => issue.message).join(", ");
        console.log("An error has occured. The error is: " + errorMessage);
        res.status(400).json({
            error: `An error has occured. The error is: ${errorMessage}`
        });
        return;
    }
    try {
        await UserAppointmentWithDoctorModel.create({
            user,
            doctor,
            problem,
            appointment_date: appointment_date ? new Date(appointment_date) : undefined,
            appointment_time
        });
        res.json({
            message: `Your appointment is complete and the date of appointment is ${appointment_date} and the timing is ${appointment_time}`
        });
    } catch (err) {
        console.log(`the error is: ${err}`);
        res.status(500).json({
            error: `an error has occured and the error is ${err}`
        });
    }
});

//Router where the user double verify that the doctor has done he check up
UsersRouter.put("/appointment/:_doctorId/:_appointmentId", UserMiddleware, async (req, res) => {
    const ValidEntry = z.object({
        done_by_user: z.boolean()
    });
    const user = req.userId;
    const appointmentId = req.params._appointmentId;
    const doctor = req.params._doctorId;
    const { done_by_user } = req.body;
    
    const isValidEntry = ValidEntry.safeParse({
        done_by_user
    });
    
    if (!isValidEntry.success) {
        const errorMessage = isValidEntry.error.issues.map(issue => issue.message).join(", ");
        console.log("An error has occured. The error is: " + errorMessage);
        res.status(400).json({
            error: `An error has occured. The error is: ${errorMessage}`
        });
        return;
    }
    
    try {
        const appointment = await UserAppointmentWithDoctorModel.findOne({
            _id: appointmentId,
            user: user,
            doctor: doctor
        });

        if (!appointment) {
            return res.status(404).json({
                error: "Appointment not found or does not belong to this user and doctor"
            });
        }

        await UserAppointmentWithDoctorModel.findByIdAndUpdate(
            appointmentId,
            { 
                done_by_user: done_by_user
            },
            { new: true }
        );
        res.json({
            message: "Success your problem is over!"
        });
    } catch (err) {
        console.log("An error occurred: " + err);
        res.status(500).json({
            error: `Error updating appointment: ${err.message}`
        });
    }
});

module.exports = {
    UsersRouter
};
