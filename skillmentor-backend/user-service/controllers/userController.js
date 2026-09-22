const UserProfile = require('../models/UserProfile');

exports.saveProfile = async (req, res) => {
  try {
    const { currentLevel, careerPath, knownSkills } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { user: req.user.id },
      { currentLevel, careerPath, knownSkills },
      { upsert: true, new: true }
    );
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.id });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
