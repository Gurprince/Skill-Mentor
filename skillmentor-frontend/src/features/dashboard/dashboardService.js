const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const BASE_URL = `${API_BASE}/api/roadmap`;

export const getUserResults = async (token) => {
  const res = await fetch(`${API_BASE}/api/user/results`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.msg || 'Failed to fetch results');
  }
  return await res.json();
};

export const getTaskResult = async (token, taskId) => {
  const res = await fetch(`${API_BASE}/api/task/${taskId}/result`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.msg || 'Failed to fetch task result');
  }
  return await res.json();
};

export const getMyTasks = async (token) => {
  const res = await fetch(`${API_BASE}/api/task/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.msg || 'Failed to fetch tasks');
  }
  return await res.json();
};

export const fetchRoadmap = async (token) => {
  const res = await fetch(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) {
    return { success: false, roadmap: null };
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || 'Failed to fetch roadmap');
  }
  return await res.json();
};

export const generateRoadmap = async (profile, token) => {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      careerPath: profile.careerPath,
      currentLevel: profile.currentLevel,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || 'Failed to generate roadmap');
  }
  return await res.json();
};

export const resetAndGenerate = async (profile, token) => {
  const res = await fetch(`${BASE_URL}/reset-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      careerPath: profile.careerPath,
      currentLevel: profile.currentLevel,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || 'Failed to reset and generate roadmap');
  }
  return await res.json();
};
