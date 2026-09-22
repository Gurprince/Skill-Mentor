import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveProfile } from './profileService';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, User, Briefcase, Code } from 'lucide-react';
import '../../styles/Dashboard.css';

const ProfileSetupPage = () => {
  const { updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [careerPath, setCareerPath] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [knownSkills, setKnownSkills] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const skillsArray = knownSkills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const profileData = {
        careerPath,
        currentLevel,
        knownSkills: skillsArray,
        isComplete: true,
      };

      const savedProfile = await saveProfile(profileData, token);
      updateUserProfile(savedProfile);
      navigate('/dashboard', {
        replace: true,
        state: { from: 'profile-setup' },
      });
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(location.state?.from || '/dashboard', { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto mt-10 sm:mt-20 p-6 bg-gray-800/90 border border-gray-700 rounded-2xl shadow-md backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
          <User className="w-6 h-6 text-[#8C49E9]" />
          Complete Your Profile
        </h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
          aria-label="Cancel profile setup"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 bg-red-900/50 border border-red-700 rounded-lg p-2 mb-4 text-sm"
          role="alert"
        >
          {error}
        </motion.p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="career-path" className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-[#4AC1FF]" />
            Career Path
          </label>
          <input
            id="career-path"
            type="text"
            value={careerPath}
            onChange={(e) => setCareerPath(e.target.value)}
            required
            placeholder="e.g., Fullstack Developer, DevOps Engineer"
            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 text-sm focus:ring-2 focus:ring-[#8C49E9] focus:outline-none"
            aria-label="Enter your career path"
          />
        </div>
        <div>
          <label htmlFor="current-level" className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
            <User className="w-4 h-4 text-[#4AC1FF]" />
            Current Level
          </label>
          <select
            id="current-level"
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value)}
            required
            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 text-sm focus:ring-2 focus:ring-[#8C49E9] focus:outline-none"
            aria-label="Select your current experience level"
          >
            <option value="">Select your current level</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Final Year">Final Year</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label htmlFor="known-skills" className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
            <Code className="w-4 h-4 text-[#4AC1FF]" />
            Known Skills (comma separated)
          </label>
          <input
            id="known-skills"
            type="text"
            value={knownSkills}
            onChange={(e) => setKnownSkills(e.target.value)}
            placeholder="e.g., JavaScript, React, SQL"
            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 text-sm focus:ring-2 focus:ring-[#8C49E9] focus:outline-none"
            aria-label="Enter your known skills, separated by commas"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-700/50 text-gray-100 border border-gray-600 hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
            aria-label="Cancel profile setup"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white flex items-center gap-2 ${
              loading
                ? 'bg-[#8C49E9]/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#8C49E9] to-[#4AC1FF] hover:bg-[#8C49E9]'
            } focus:outline-none focus:ring-2 focus:ring-[#8C49E9]`}
            aria-label={loading ? 'Saving profile' : 'Save profile'}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProfileSetupPage;