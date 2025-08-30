import { User } from "../models/userModel.js";

export async function registerUser({ username, email, password }) {
    // check if email exists
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already registered");

    const user = new User({ username, email, password });
    await user.save();
    return { id: user._id, username: user.username, email: user.email };
}
