import bcrypt from "bcryptjs";
import User from "../../models/User.js";

export const signUp = async (_: any, { input }: { input: {
  username: string;
  email: string;
  phonenumber: string;
  password: string;
} }) => {
  const { username, email, phonenumber, password } = input;

  if (!username || !email || !phonenumber || !password) {
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    phonenumber,
    role: "user",
    password: hashedPassword,
  });

  return { success: true, user };
};
