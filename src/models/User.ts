import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'karyawan'], default: 'karyawan' },
});

const User = models.User || mongoose.model('User', UserSchema);
export default User;
