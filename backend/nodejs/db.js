const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGOOSE_URL;

if (!mongoUri) {
    console.error("MONGOOSE_URL is not defined. Add it to your .env file.");
} else {
    mongoose.connect(mongoUri).then(() => console.log("The database is running"));
}

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId

// Schemas for users

// for a new user
const userSchema = new Schema({
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: String,
    location: String,
    city: { type: String, default: "Not provided" },
    pin_code: Number
});

// for the family member of the user
const memberSchema = new Schema({
    username: ObjectId,
    first_name: String,
    last_name: String,
    date_of_birth: Date
});

// The problem the user is facing with AI triage analysis & doctor validation
const userProblemSchema = new Schema({
    user: { type: ObjectId, ref: "users" },
    name: { type: ObjectId, ref: "members" },
    problem: String,
    description: String,
    type: { type: ObjectId, ref: "problem_type" },
    ai_analysis: {
        recommended_specialist: String,
        all_possible_specialists: [String],
        possible_conditions: [String],
        triage_urgency: String,
        analysis_summary: String,
        suggested_questions_for_doctor: [String],
        general_health_advice: [String],
        disclaimer: String
    },
    status: { type: String, enum: ["pending_doctor_review", "doctor_verified", "doctor_corrected", "closed"], default: "pending_doctor_review" },
    created_at: { type: Date, default: Date.now }
});

// Appointment of the doctor the user does online
const userAppointmentWithDoctorSchema = new Schema({
    user: ObjectId,
    doctor: ObjectId,
    problem: ObjectId,
    appointment_date: { type: Date, default: Date.now },
    appointment_time: String,
    done_by_doctor: { type: Boolean, default: false },
    done_by_user: { type: Boolean, default: false }
});

// Schemas for admins
// for a new admin
const adminSchema = new Schema({
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: String,
    first_name: String,
    last_name: String
});

// Schemas for doctors
// for a new doctor
const doctorSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    first_name: String,
    last_name: String,
    mbbs_code: String,
    specialization: String,
    location: String,
    city: String,
    pin_code: Number,
    open_time: String,
    close_time: String
});

// the validatation by the doctor for the AI solution
const problemSolutionByDoctorSchema = new Schema({
    doctor: ObjectId,
    user_problem: ObjectId,
    verifyIsTrue: Boolean,
    solution: { type: String, default: "No solution provided by the doctor" }
});

// the domain of problem the user is facing
const typeOfProblemSchema = new Schema({
    name: String,
    description: String
});

const doctorSpecializationSchema = new Schema({
    name: String
});

// User models
const UserModel = mongoose.model("users", userSchema);
const MemberModel = mongoose.model("members", memberSchema);
const UserProblemModel = mongoose.model("user_problems", userProblemSchema);
const UserAppointmentWithDoctorModel = mongoose.model("user_appointments", userAppointmentWithDoctorSchema);

// admin models
const AdminModel = mongoose.model("admins", adminSchema);

// doctor models
const DoctorModel = mongoose.model("doctors", doctorSchema);
const ProblemSolutionByDoctorModel = mongoose.model("doctors_solution", problemSolutionByDoctorSchema);
const TypeOfProblemModel = mongoose.model("problem_type", typeOfProblemSchema);
const DoctorSpecializationModel = mongoose.model("doctor_specialization", doctorSpecializationSchema);

module.exports = {
    UserModel,
    MemberModel,
    UserProblemModel,
    UserAppointmentWithDoctorModel,

    AdminModel,

    DoctorModel,
    ProblemSolutionByDoctorModel,
    TypeOfProblemModel,
    DoctorSpecializationModel
};