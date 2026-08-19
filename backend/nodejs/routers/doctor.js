const express = require("express");
const bcrypt = require("bcrypt");
const { DoctorModel, UserProblemModel, ProblemSolutionByDoctorModel, UserAppointmentWithDoctorModel } = require("../db");
const { DoctorMiddleware, addRevokedToken } = require("../middlewares/auth")
const { z } = require("zod");
const { JWT_DOCTOR_SECRET } = require("../config");
const jwt = require("jsonwebtoken");

const Router = express.Router;

const DoctorRouter = Router();


// Router for the signup end point
DoctorRouter.post(["/signup", "/signup/"], async (req, res) => {
    const CheckDoctorInput = z.object({
        email: z.string().email().min(5).max(100),
        password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        first_name: z.string().min(2).max(50),
        last_name: z.string().min(3).max(50),
        mbbs_code: z.string().min(2).max(100),
        specialization: z.string().min(2).max(100),
        location: z.string().max(400),
        city: z.string().min(2).max(50),
        pin_code: z.number().positive().int().min(100000).max(999999),
        open_time: z.string().min(4).max(5),
        close_time: z.string().min(4).max(5)
    });

    const { email, password, first_name, last_name, mbbs_code, specialization, location, city, pin_code, open_time, close_time } = req.body;

    const validZod = CheckDoctorInput.safeParse({
        email, password, first_name, last_name, mbbs_code, specialization, location, city, pin_code, open_time, close_time
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
            await DoctorModel.create({
                email,
                password: hashPassword,
                first_name,
                last_name,
                mbbs_code,
                specialization,
                location,
                city,
                pin_code,
                open_time,
                close_time
            });
        } catch (err) {
            console.log("An error occured: " + err);
            res.status(400).json({
                error: `The error occured is ${err}`
            });
            return;
        }

        res.json({
            message: "You have signed up as a Doctor!"
        });
    }
});

// Router for login end point
DoctorRouter.post(["/login", "/login/"], async (req, res) => {
    const checkDoctorEntry = z.object({
        email: z.string().email().min(3).max(100),
        password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    });

    const { email, password } = req.body;

    const DoctorIsCorrect = checkDoctorEntry.safeParse({
        email, password
    });

    if (!DoctorIsCorrect.success) {
        const errorMessage = DoctorIsCorrect.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({
            error: `An error has occurred. The error is: ${errorMessage}`
        });
    }

    const IsDoctorValid = await DoctorModel.findOne({
        email
    });

    if (!IsDoctorValid) {
        res.status(403).json({
            error: `The email did not match`
        });
        return;
    }

    const isCorrect = await bcrypt.compare(password, IsDoctorValid.password);

    if (!isCorrect) {
        res.status(403).json({
            error: `An error has occurred. The password did not match`
        });
        return;
    } else {
        const token = jwt.sign({
            id: IsDoctorValid._id
        }, JWT_DOCTOR_SECRET);
        // cookie logic can be even used
        res.json({
            message: "You have successfully logged in as a doctor!",
            token: token
        });
    }
});

DoctorRouter.post(["/update-password", "/update-password/"], async (req, res) => {
    const PasswordUpdateInput = z.object({
        email: z.string().email().min(5).max(100),
        current_password: z.string().min(6).max(100),
        new_password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    });

    const { email, current_password, new_password } = req.body;
    const validEntry = PasswordUpdateInput.safeParse({ email, current_password, new_password });

    if (!validEntry.success) {
        const errorMessage = validEntry.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({
            error: `An error has occurred. The error is: ${errorMessage}`
        });
    }

    const doctor = await DoctorModel.findOne({ email });
    if (!doctor) {
        return res.status(404).json({
            error: "The email did not match"
        });
    }

    const isCorrect = await bcrypt.compare(current_password, doctor.password);
    if (!isCorrect) {
        return res.status(403).json({
            error: "Current password did not match"
        });
    }

    doctor.password = bcrypt.hashSync(new_password, 10);
    await doctor.save();

    res.json({
        message: "Password updated successfully. Please sign in with your new password."
    });
});

DoctorRouter.post(["/forgot-password", "/forgot-password/"], async (req, res) => {
    const ForgotPasswordInput = z.object({
        email: z.string().email().min(5).max(100),
        mbbs_code: z.string().min(2).max(100),
        new_password: z.string().min(6).max(100).regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    });

    const { email, mbbs_code, new_password } = req.body;
    const validEntry = ForgotPasswordInput.safeParse({ email, mbbs_code, new_password });

    if (!validEntry.success) {
        const errorMessage = validEntry.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({
            error: `An error has occurred. The error is: ${errorMessage}`
        });
    }

    const doctor = await DoctorModel.findOne({ email, mbbs_code });
    if (!doctor) {
        return res.status(404).json({
            error: "No doctor account matched that email and MBBS code."
        });
    }

    doctor.password = bcrypt.hashSync(new_password, 10);
    await doctor.save();

    res.json({
        message: "Password reset successfully. Please sign in with your new password."
    });
});

// Router where the doctor sees all the problems of the users
DoctorRouter.get("/get-all-user-problems/", DoctorMiddleware, async (req, res) => {
    try {
        const UserProblems = await UserProblemModel.find({})
            .populate("user", "username email location city pin_code")
            .populate("name", "first_name last_name date_of_birth")
            .populate("type", "name description");
        res.json({
            UserProblems
        });
    } catch (err) {
        console.log("The error is: " + err);
        res.status(500).json({
            message: `An error has occurred: ${err}`
        });
    }
});

// Router where the doctor gives his solution for the problem of the users
DoctorRouter.post("/solution-of-user-problem/:_id", DoctorMiddleware, async (req, res) => {
    const ValidEntry = z.object({
        verifyIsTrue: z.boolean(),
        solution: z.string().optional()
    })
    const problemId = req.params._id;
    const { verifyIsTrue, solution } = req.body;

    const EntryIsCorrect = ValidEntry.safeParse({
        verifyIsTrue, solution
    });

    if (!EntryIsCorrect.success) {
        const errorMessage = EntryIsCorrect.error.issues.map(issue => issue.message).join(", ");
        console.log("An error has occured. The error is: " + errorMessage);
        res.status(400).json({
            error: `An error has occured. The error is: ${errorMessage}`
        });
        return;
    }

    try {
        const doctorId = req.doctorId;
        const doctormodelsolution = await ProblemSolutionByDoctorModel.create({
            doctor: doctorId,
            user_problem: problemId,
            verifyIsTrue,
            solution: solution || (verifyIsTrue ? "AI recommendation verified by doctor." : "Doctor provided revised clinical correction.")
        });

        // Update problem status based on doctor verification
        await UserProblemModel.findByIdAndUpdate(problemId, {
            status: verifyIsTrue ? "doctor_verified" : "doctor_corrected"
        });

        res.json({
            message: verifyIsTrue 
                ? "AI solution verified and approved by doctor!" 
                : "AI solution corrected and revised clinical guidance submitted!",
            doctormodelsolution
        });
    } catch (err) {
        console.log("An error has occurred: " + err);
        res.status(500).json({
            message: `The error which occurred is: ${err}`
        });
    }
});

// Router for the doctor to see all his appointments with the users
DoctorRouter.get("/all-appointments/", DoctorMiddleware, async (req, res) => {
    const doctorId = req.doctorId;
    try {
        const DoctorsAppointments = await UserAppointmentWithDoctorModel.find({
            doctor: doctorId
        });
        res.json({
            DoctorsAppointments
        });
    } catch (err) {
        console.log(`an error has occured and the error is: ${err}`);
        res.status(500).json({
            error: `an error has occured and the error is: ${err}`
        });
    }
});

// Router for updating if the appointment is over or not
DoctorRouter.put("/appointment/:_id", DoctorMiddleware, async (req, res) => {
    const ValidEntry = z.object({
        done_by_doctor: z.boolean()
    });
    const appointmentId = req.params._id;
    const doctorId = req.doctorId;
    const { done_by_doctor } = req.body;
    
    const isValidEntry = ValidEntry.safeParse({
        done_by_doctor
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
            doctor: doctorId
        });
        
        if (!appointment) {
            return res.status(404).json({
                error: "Appointment not found or does not belong to this doctor"
            });
        }
        
        await UserAppointmentWithDoctorModel.findByIdAndUpdate(
            appointmentId,
            { done_by_doctor: done_by_doctor },
            { new: true }
        );
        
        res.json({
            message: `The appointment with ID: ${appointmentId} has been updated by doctor`
        });
    } catch (err) {
        console.log(`an error has occured and the error is ${err}`);
        res.status(500).json({
            error: `an error has occured and the error is ${err}`
        });
    }
});

// Logout route for doctors
DoctorRouter.post("/logout/", DoctorMiddleware, (req, res) => {
    addRevokedToken(req.token);
    res.json({
        message: "You have successfully logged out as a doctor!"
    });
});

module.exports = {
    DoctorRouter
}
