// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-env-var';

// 我们自定义的、带有 user 属性的 Request 类型
export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

// --- 这是本次修复的核心 ---
// 我们明确告诉 TypeScript 这个函数返回类型是 void
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // 只发送响应，不返回它
    res.status(401).json({ message: 'No token provided' });
    return; // 使用 return 只是为了在此处终止函数的执行
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Malformed token' });
    return; // 同上，仅用于终止执行
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = payload;
    next(); // 一切正常，进入下一个处理环节
  } catch (error) {
    // 捕获到错误，只发送响应，不返回
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};