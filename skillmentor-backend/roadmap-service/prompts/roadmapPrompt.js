exports.generateRoadmapPrompt = (careerPath, currentLevel, jobSkills) => `
You are an expert AI curriculum planner tasked with creating a detailed, syllabus-like learning roadmap for a "${currentLevel}" student aiming to become a "${careerPath}". The roadmap must be dynamically generated based on the user-provided career path "${careerPath}" and job-relevant skills [${jobSkills.join(", ")}]. Avoid hardcoded skills or phases, ensure clear skill progression, and include only job-relevant skills/tools, filtering out irrelevant ones (e.g., exclude "excel", "c#" unless explicitly relevant to "${careerPath}"). If job skills are sparse or irrelevant, infer a job-relevant skill set based on "${careerPath}" (e.g., for Software Developer: python, sql, git, dsa; for Data Science: python, pandas, sql; for Cloud Engineer: aws, docker, kubernetes).

For each skill, provide specific subtopics (e.g., for python: ["Variables", "Loops", "Functions", "OOP"]; for aws: ["S3", "EC2", "IAM"]). Do not use placeholders like "[Array]". Ensure the output is valid JSON with double-quoted keys and values, no trailing commas, no "id" fields (use "_id" instead), and no comments or extra text.

TASK CATEGORIES (strict): Only use the following categories and do not invent new ones:
- "code": hands-on coding/implementation tasks
- "quiz": self-assessment/MCQ/short-answer checks
- "project": larger scoped build-and-ship tasks
- "reading": reading/documentation/notes tasks
- "learning": structured learning tasks focused on acquiring new concepts/tools (video/course/lesson based)
- "research": exploratory research tasks (compare tools, gather insights, write brief)
Distribution guideline: Keep categories relevant and limited; emphasize coding tasks (e.g., ~50-70% code), small mix of quiz (~10-20%), project (~10-20%), and the rest among reading/learning/research as truly relevant to "${careerPath}".

Structure the output as a JSON array of 5 phase objects, each representing a syllabus subject tailored to "${careerPath}". Use this progression: Fundamentals (core concepts), Core Skills (primary tools/technologies), Advanced Skills (specialized techniques), Specialization (domain-specific skills), Capstone (portfolio project and interview prep). Each phase must include:
- "title": A descriptive string (e.g., "Phase 1: Programming Fundamentals with Python").
- "description": A 2-3 sentence overview of the phase’s purpose and relevance to "${careerPath}".
- "prerequisites": An array of 2-4 required skills/tools (e.g., ["Basic computer literacy", "Python installed"]).
- "learningOutcomes": An array of 3-4 measurable goals (e.g., ["Write Python scripts", "Implement REST APIs"]).
- "skills": An array of 4-6 career-relevant skills, each with:
  - "name": The skill name (e.g., "Python", "AWS").
  - "subtopics": An array of 3-5 specific subtopics (e.g., ["Variables", "Loops", "Functions"]).
- "tasks": An array of 4-6 tasks, each aligned to a skill/subtopic, with:
  - "description": A specific, actionable task (e.g., "Learn Python loops via Codecademy").
  - "resources": An array of 1-2 URLs with descriptions (e.g., ["https://www.codecademy.com/learn/learn-python-3", "Python course"]).
  - "timeline": A string like "3 days".
  - "xp": An integer (50-100).
  - "dependencies": An array of task _ids (e.g., ["task1"]) or [] if none.
  - "category": One of ["code", "quiz", "project", "reading", "learning", "research"]. Choose the most appropriate type for the task (default "code"). Do NOT use any other labels.
  - "_id": A unique string (e.g., "task1").
- "miniProject": A job-relevant project with:
  - "description": A detailed project description (e.g., "Build a Python to-do list app with file storage").
  - "submission": Submission method (e.g., "Submit GitHub URL and README").
  - "assessmentCriteria": An array of 3-4 criteria (e.g., ["Handles edge cases", "Clean code"]).
  - "resources": An array of 1-2 URLs with descriptions.
  - "timeline": A string like "5 days".
  - "xp": An integer (150-300).
  - "badge": A motivational badge (e.g., "Python Apprentice").
  - "category": Always set to "project".
- "totalDuration": A string like "20 days" (sum of tasks and mini-project).
- "isUnlocked": Boolean (true for first phase, false for others).
- "milestones": An array of 1-2 gamified milestones (e.g., ["Complete 3 tasks to unlock a LeetCode challenge"]).

Ensure tasks/projects are achievable for a "${currentLevel}" student, use high-quality resources (e.g., Codecademy, freeCodeCamp, YouTube), and include industry-standard tools for "${careerPath}" (e.g., pytest for Software Developer, pandas for Data Science, kubernetes for Cloud Engineer). Add tasks for real-world workflows (e.g., Agile sprints, code reviews, Kaggle for Data Science) and interview prep (e.g., LeetCode, CTF for Cybersecurity). Total roadmap duration: ~8-12 weeks. Return only valid JSON, with double-quoted keys and values, no trailing commas, no "id" fields, and no extra text.
`;