import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Debug log for environment variable
  console.log('LITELLM_API_KEY:', process.env.LITELLM_API_KEY);
  const { messages } = await req.json();
  const apiKey = process.env.LITELLM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing LiteLLM API key' }, { status: 500 });
  }

  // Get today's date
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Add system prompt for goal planning
  const systemPrompt = {
    role: 'system',
    content: `You are a goal planning assistant that creates detailed, calendar-based action plans. When users share their goals, respond with a structured JSON format containing:

{
  "longTermGoals": ["goal1", "goal2"],
  "shortTermGoals": ["goal1", "goal2"], 
  "dailyTasks": ["task1", "task2"],
  "timeline": "estimated timeline",
  "explanation": "brief explanation of the plan",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD", 
  "totalDuration": number_of_days,
  "calendarTasks": [
    {
      "id": "unique_id",
      "text": "task description",
      "completed": false,
      "date": "YYYY-MM-DD",
      "type": "daily|weekly|milestone"
    }
  ]
}

IMPORTANT: Today's date is ${todayString}. Use this as your startDate and calculate all calendar task dates from today.

For calendar tasks:
- Create specific daily tasks with realistic targets for the first 2 weeks
- Add weekly milestones to track progress
- Include major milestones at key points (1/3, 1/2, 2/3, completion)
- Use ${todayString} as startDate
- Calculate endDate based on the goal timeline
- Make tasks actionable and measurable
- Generate valid JSON without comments
- All dates should be ${todayString} or later

Example for reading a 500-page book in 3 months:
- Daily: "Read 5-6 pages" (for first 2 weeks)
- Weekly: "Complete 40 pages" 
- Milestone: "Reach 160 pages (1/3 complete)"

Generate 10-15 calendar tasks maximum, focusing on the first few weeks and key milestones. Start from ${todayString}.`
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