import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  profilePicture: {
    type: String,
    default: '',
  },
  username: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxLength: 500,
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  notificationPreferences: {
    chat: { type: Boolean, default: true },
    wishlist: { type: Boolean, default: true },
    review: { type: Boolean, default: true },
    report: { type: Boolean, default: true },
  },
  privacyPreferences: {
    publicProfile: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showPhoneNumber: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false },
  },
  appearance: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
}, {
  timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    if (typeof next === 'function') return next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (typeof next === 'function') next();
});

const User = mongoose.model('User', userSchema);

export default User;
