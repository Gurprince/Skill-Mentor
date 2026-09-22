// Corrected base
const BASE_URL = import.meta.env.VITE_USER_SERVICE_BASE_URL || 'http://localhost:5000/api/user';

export const saveProfile = async (profileData, token) => {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || 'Failed to save profile');
  }

  return await res.json();
};

export const fetchProfile = async (token) => {
  const res = await fetch(`${BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || 'Failed to fetch profile');
  }

  return await res.json();
};
