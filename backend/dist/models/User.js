"use strict";
// File: backend/src/models/User.ts
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String },
    color: { type: String }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('User', userSchema);
