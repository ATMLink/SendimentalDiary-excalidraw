// app/src/types/user.ts
export interface Partner {
  _id: string;
  username: string;
  color: string;
  moodValue?: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  color: string;
  partner?: Partner
  moodValue?: number;
}