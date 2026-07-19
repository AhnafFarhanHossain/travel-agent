import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

const signUp = async (name: string, email: string, password: string) => {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  // check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists");
  }

  const hashed = await bcrypt.hash(password, 12);
  // verify the email using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email");
  }

  // verify poassword (must be atleast 8 characters, contain at least one uppercase letter, one lowercase letter, one number)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number",
    );
  }

  const res = await User.create({
    name,
    email,
    password: hashed,
  });

  return {
    res,
    sucess: true,
    message: "User created successfully",
  };
};
