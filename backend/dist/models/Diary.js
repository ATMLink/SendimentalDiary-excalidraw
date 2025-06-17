"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: backend/src/routes/diaries.ts
const mongoose_1 = require("mongoose");
const diarySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    mood: { type: String, required: true },
    content: { type: String, default: '' },
    image: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Diary', diarySchema);
