import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

export const logIn = async (
  _: any,
  { input }: { input: { email: string; password: string } }
) => {
  const { email, password } = input;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Ensure email exists
  const user = await User.findOne({ where: { email } });
  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  }

  // Check password safely
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    token,
    user,
  };
};
