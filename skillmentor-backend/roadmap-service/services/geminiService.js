const axios = require('axios');
const { generateRoadmapPrompt } = require('../prompts/roadmapPrompt');

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function generateRoadmapFromGemini(careerPath, currentLevel, jobSkills) {
  const prompt = generateRoadmapPrompt(careerPath, currentLevel, jobSkills);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { 
          contents: [{ 
            parts: [{ 
              text: prompt + '\n\nIMPORTANT: Respond with valid JSON only, without any markdown code blocks (do not use ```json or ```). The response must be a valid JSON array of phase objects.' 
            }] 
          }] 
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Clean the response text by removing markdown code blocks and trim whitespace
      const responseText = response.data.candidates[0].content.parts[0].text;
      const cleanText = responseText
        .replace(/^```(?:json)?\n|\n```$/g, '')  // Remove code block markers
        .trim();
      
      // Parse the cleaned JSON
      return JSON.parse(cleanText);
    } catch (error) {
      if (error.response?.status === 503 && attempt < MAX_RETRIES) {
        console.warn(`Attempt ${attempt} failed with 503. Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      console.error('Gemini API error:', error.message);
      // Fallback to a default roadmap template if API fails
      return generateFallbackRoadmap(careerPath, currentLevel, jobSkills);
    }
  }
  throw new Error('Gemini generation failed after max retries');
}

function generateFallbackRoadmap(careerPath, currentLevel, jobSkills) {
  // Basic fallback roadmap template: return an array of phase objects
  const skillsList = jobSkills && jobSkills.length ? jobSkills : ['javascript', 'react', 'node', 'sql'];
  const coreSkill = skillsList[0] || 'fundamentals';

  const phases = [
    {
      title: `Phase 1: ${careerPath} Fundamentals`,
      description: `Learn the foundational concepts and tools required for ${careerPath}.`,
      prerequisites: ['Basic computer literacy'],
      learningOutcomes: [
        `Understand core ${careerPath} concepts`,
        `Set up development environment`
      ],
      skills: skillsList.slice(0, 4).map(skill => ({ name: skill, subtopics: ['Basics', 'Practice'] })),
      tasks: [
        {
          description: `Learn the basics of ${coreSkill}.`,
          resources: ['https://www.freecodecamp.org/', 'freeCodeCamp'],
          timeline: '3 days',
          xp: 50,
          dependencies: [],
          _id: 'task-fallback-1'
        },
        {
          description: `Build a small demo using ${coreSkill}.`,
          resources: ['https://www.youtube.com/', 'YouTube tutorial'],
          timeline: '2 days',
          xp: 60,
          dependencies: ['task-fallback-1'],
          _id: 'task-fallback-2'
        }
      ],
      miniProject: {
        description: `Create a simple ${careerPath} project showcasing fundamentals.`,
        submission: 'Submit GitHub URL and README',
        assessmentCriteria: ['Functionality', 'Code readability', 'Documentation'],
        resources: ['https://docs.github.com/', 'GitHub Docs'],
        timeline: '4 days',
        xp: 200,
        badge: `${careerPath} Starter`
      },
      totalDuration: '9 days',
      isUnlocked: true,
      milestones: ['Complete fundamentals mini project']
    },
    {
      title: `Phase 2: Core ${careerPath} Skills`,
      description: `Deepen your knowledge with core tools and workflows used in ${careerPath}.`,
      prerequisites: ['Phase 1 completed'],
      learningOutcomes: [
        `Apply ${coreSkill} to practical tasks`,
        'Use version control with Git'
      ],
      skills: skillsList.slice(0, 4).map(skill => ({ name: skill, subtopics: ['Intermediate', 'Best Practices'] })),
      tasks: [
        {
          description: 'Learn Git branching and pull requests',
          resources: ['https://www.atlassian.com/git', 'Atlassian Git'],
          timeline: '2 days',
          xp: 70,
          dependencies: [],
          _id: 'task-fallback-3'
        }
      ],
      miniProject: {
        description: `Implement a feature in your ${careerPath} project using best practices.`,
        submission: 'Submit repository URL and feature description',
        assessmentCriteria: ['Best practices', 'Testing', 'Commit history quality'],
        resources: ['https://git-scm.com/docs', 'Git Docs'],
        timeline: '4 days',
        xp: 220,
        badge: `${careerPath} Practitioner`
      },
      totalDuration: '8 days',
      isUnlocked: false,
      milestones: ['Open a pull request', 'Complete code review']
    },
    {
      title: `Phase 3: Capstone and Interview Prep`,
      description: 'Build a capstone project and prepare for interviews.',
      prerequisites: ['Phase 2 completed'],
      learningOutcomes: ['Build and deploy a project', 'Practice interview questions'],
      skills: [
        { name: 'Problem Solving', subtopics: ['DSA basics', 'Practice'] },
        { name: 'Communication', subtopics: ['Docs', 'Presentations'] }
      ],
      tasks: [
        {
          description: 'Solve 10 practice problems on LeetCode',
          resources: ['https://leetcode.com/', 'LeetCode'],
          timeline: '3 days',
          xp: 90,
          dependencies: [],
          _id: 'task-fallback-4'
        }
      ],
      miniProject: {
        description: `Capstone: Complete a portfolio-ready ${careerPath} project and deploy it.`,
        submission: 'Submit live URL and repository',
        assessmentCriteria: ['Deployment', 'Stability', 'Documentation'],
        resources: ['https://vercel.com/docs', 'Deployment Guide'],
        timeline: '5 days',
        xp: 300,
        badge: `${careerPath} Capstone`
      },
      totalDuration: '10 days',
      isUnlocked: false,
      milestones: ['Publish project', 'Mock interview']
    }
  ];

  return phases;
}

module.exports = { generateRoadmapFromGemini };