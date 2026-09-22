// Script to check evaluation data in the database
const mongoose = require('mongoose');
require('dotenv').config();

async function checkEvaluation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Import the Evaluation model
    const Evaluation = require('./task-service/models/Evaluation');
    
    // Find the evaluation for the submission
    const evaluation = await Evaluation.findOne({ submission: '689cab0e7e110c468af14c3b' });
    
    if (!evaluation) {
      console.log('No evaluation found for submission 689cab0e7e110c468af14c3b');
      return;
    }

    console.log('Evaluation found:');
    console.log(JSON.stringify(evaluation, null, 2));
    
    // Check the task progress
    const TaskProgress = require('./task-service/models/TaskProgress');
    const progress = await TaskProgress.findOne({ task: '689b59b533ad6c41362f2ad2' });
    
    console.log('\nTask Progress:');
    console.log(JSON.stringify(progress, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking evaluation:', error);
    process.exit(1);
  }
}

checkEvaluation();
