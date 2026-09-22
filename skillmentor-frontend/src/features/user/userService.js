// src/features/user/userService.js
import axios from 'axios';

export const fetchUserProfile = async (token) => {
  try {
    const res = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return null; // profile not found or error
  }
};
