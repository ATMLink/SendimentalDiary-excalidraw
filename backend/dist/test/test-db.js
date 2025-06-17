"use strict";
// backend/src/test-db.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Diary_1 = __importDefault(require("../models/Diary")); // 确保路径正确
// 你的数据库连接字符串
const MONGO_URI = 'mongodb://localhost:27017/zeldaDiary';
// 模拟一个前端发来的、包含 tag '666' 的筛选请求
const testFilter = {
    // 替换成你的真实 user ID
    user: new mongoose_1.default.Types.ObjectId('681c3e1bede5254da9cc56a6'),
    tags: {
        $in: ['666'] // 我们要测试的核心查询条件
    }
};
const runTest = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGO_URI);
        console.log('MongoDB connected.');
        console.log('Executing find with filter:', JSON.stringify(testFilter, null, 2));
        // 直接执行查询
        const diaries = await Diary_1.default.find(testFilter);
        console.log('--- TEST RESULT ---');
        if (diaries.length > 0) {
            console.log(`Success! Found ${diaries.length} diary/diaries.`);
            console.log(diaries.map(d => ({ title: d.title, tags: d.tags })));
        }
        else {
            console.log('Query returned no results. No diaries found with the specified filter.');
        }
        console.log('-------------------');
    }
    catch (error) {
        console.error('An error occurred:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('MongoDB disconnected.');
    }
};
runTest();
