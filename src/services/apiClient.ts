/**
 * Shared Gemini API caller for frontend services
 */
export async function callGeminiAPI(payload: {
  module: string;
  task: string;
  sourceDocuments: Array<{ name: string; content: string }>;
  userInput: any;
  config: any;
  sourceLock: boolean;
  allowExternalKnowledge: boolean;
  previousStepsData?: any;
}) {
  try {
    const res = await fetch('/api/gemini/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`Server responded with status ${res.status}, switching to built-in generator.`);
      return { success: false, useClientFallback: true };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API call error, switching to built-in generator:', err);
    return { success: false, useClientFallback: true };
  }
}
