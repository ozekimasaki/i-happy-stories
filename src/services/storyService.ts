export const generateStory = async (prompt: string): Promise<string> => {
  // TODO: Implement actual AI story generation logic here (Task 70)
  console.log(`Generating story for prompt: "${prompt}"`);

  // For now, return a dummy story after a short delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const dummyStory = `This is a story about "${prompt}". Once upon a time, in a land far, far away...`;
  
  return dummyStory;
}; 