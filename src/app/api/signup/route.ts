import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // TODO: Connect to your preferred email service
    // Options:
    // 1. Buttondown: https://buttondown.email/api
    // 2. Mailchimp: https://mailchimp.com/developer/marketing/api/
    // 3. Google Forms: https://developers.google.com/forms/api
    // 4. Simple database storage for now

    // For now, we'll just log the email and return success
    console.log('New signup:', email);

    // Example Buttondown integration (uncomment and configure):
    /*
    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        tags: ['early-access'],
        metadata: {
          source: 'goalai-landing-page'
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to newsletter');
    }
    */

    // Example Mailchimp integration (uncomment and configure):
    /*
    const response = await fetch(`https://us1.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        tags: ['early-access'],
        merge_fields: {
          SOURCE: 'goalai-landing-page'
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to newsletter');
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully joined the waitlist!' 
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'Failed to join waitlist. Please try again.' 
    }, { status: 500 });
  }
} 