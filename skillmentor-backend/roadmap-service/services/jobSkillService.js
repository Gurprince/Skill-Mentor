const axios = require('axios');

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

exports.fetchJobSkills = async (careerPath, location = 'us') => {
  try {
    const baseUrl = `https://api.adzuna.com/v1/api/jobs/${location}/search/1`;
    const response = await axios.get(baseUrl, {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        what: careerPath,
        results_per_page: 25,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const jobs = response.data?.results || [];
    if (jobs.length === 0) {
      console.warn('⚠️ No job listings found for', careerPath);
      return getDefaultSkills();
    }

    const combinedDescription = jobs.map(job => job.description).join(' ');
    const skills = extractSkillsFromText(combinedDescription);

    console.log('✅ Job API pulled:', jobs.length, 'listings');
    console.log('🎯 Extracted Skills:', skills);

    return skills.length > 0 ? skills : getDefaultSkills();
  } catch (err) {
    console.error('❌ Job API Error:', err.response?.status, err.response?.data || err.message);
    return getDefaultSkills();
  }
};

/**
 * Extract hard & soft skills from job description text
 */
function extractSkillsFromText(text) {
  if (!text) return [];

  const commonSkills = [
    // Programming Languages
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'swift', 'kotlin',
    // Frameworks & Tools
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'jenkins', 'ci/cd',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'graphql', 'rest', 'api',
    'excel', 'power bi', 'tableau', 'scikit-learn', 'numpy', 'pandas', 'matplotlib',
    // Soft Skills
    'problem solving', 'communication', 'teamwork', 'leadership', 'agile', 'scrum',
    'critical thinking', 'adaptability', 'attention to detail', 'time management',
  ];

  const foundSkills = commonSkills.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return [...new Set(foundSkills)]; // Remove duplicates
}

/**
 * Default fallback if skill extraction fails
 */
function getDefaultSkills() {
  return [
    'javascript',
    'react',
    'node',
    'sql',
    'git',
    'problem-solving',
    'communication',
    'teamwork',
    'adaptability',
    'time management',
  ];
}