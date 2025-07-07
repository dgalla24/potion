import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Debug log for environment variable
  console.log('LITELLM_API_KEY:', process.env.LITELLM_API_KEY);
  const { messages } = await req.json();
  const apiKey = process.env.LITELLM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing LiteLLM API key' }, { status: 500 });
  }

  // Add system prompt for goal planning
  const systemPrompt = {
    role: 'system',
    content: `You are a goal planning assistant. When users share their goals, respond with a structured JSON format containing:

{
  "longTermGoals": ["goal1", "goal2"],
  "shortTermGoals": ["goal1", "goal2"],
  "dailyTasks": ["task1", "task2"],
  "timeline": "estimated timeline",
  "explanation": "brief explanation of the plan"
}

Break down vague goals into specific, actionable steps. Focus on creating realistic, achievable milestones.`
  };

  const messagesWithSystem = [systemPrompt, ...messages];

  try {
    const response = await fetch('https://litellm.oit.duke.edu/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GPT 4.1 Nano', // Changed to the correct small model
        messages: messagesWithSystem,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `LiteLLM error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to contact LiteLLM', details: String(err) }, { status: 500 });
  }
} 