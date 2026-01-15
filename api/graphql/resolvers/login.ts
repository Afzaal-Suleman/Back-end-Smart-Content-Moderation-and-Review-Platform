import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

export const logIn = async (_: any, { input }: { input: { email: string; password: string } }) => {
      const { email, password } = input;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" } // Token valid for 7 days
      );

      return {
        success: true,
        token,
        user,
      };
    };

   