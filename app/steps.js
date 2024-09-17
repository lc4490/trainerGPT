// steps.js
export const steps = [
    { title: 'Tell Us About Yourself', content: 'Select your gender', options: ['Male', 'Female'] },
    { title: 'How Old Are You?', content: 'Age is important', inputType: 'string' },
    { title: 'What is Your Weight?', content: 'Enter your weight', inputType: 'string' },
    { title: 'What is Your Height?', content: 'Enter your height', inputType: 'string' },
    { title: 'What is Your Goal?', content: 'Select your goal', options: ['Weight Loss', 'Muscle Gain', 'Improved Endurance', 'General Fitness'] },
    { title: 'Physical Activity Level?', content: 'Select your activity level', options: ['Sedentary', 'Moderate', 'Active'] },
    { title: 'Do you have any existing health issues or injuries?', content: 'Enter any existing health issues or injuries', inputType: 'string' },
    { title: 'How many days a week can you commit to working out?', content: 'Select the number of workout days', inputType: 'dial', range: { min: 1, max: 7 } },
  ];
  