const mongoose = require('mongoose');
require('dotenv').config();
const Task = require('../../task-service/models/Task');

async function updateEmptyTaskTitles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find all tasks with empty or missing titles
    const tasks = await Task.find({
      $or: [
        { title: { $in: ['', null, undefined] } },
        { title: { $exists: false } }
      ]
    });

    console.log(`Found ${tasks.length} tasks with empty or missing titles`);

    let updatedCount = 0;
    
    // Update each task with a generated title
    for (const task of tasks) {
      // Generate title from description (first sentence, max 100 chars)
      const generatedTitle = task.description
        .split('.')[0] // First sentence
        .substring(0, 100) // Limit length
        .trim();

      // If we still don't have a title, use a fallback
      const newTitle = generatedTitle || `Task-${task._id.toString().substring(0, 6)}`;
      
      // Only update if we have a new title
      if (newTitle) {
        task.title = newTitle;
        await task.save();
        updatedCount++;
        console.log(`Updated task ${task._id} with title: ${newTitle}`);
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`- Total tasks processed: ${tasks.length}`);
    console.log(`- Successfully updated: ${updatedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
updateEmptyTaskTitles();
