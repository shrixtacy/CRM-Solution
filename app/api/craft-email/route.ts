import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db/supabase-direct';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { product, region, previewOnly } = await request.json();
    const allCustomers = await db.getCustomers();
    console.log('All customers:', allCustomers.length);
    
    const filteredCustomers = allCustomers.filter((customer: { state?: string }) => 
      customer.state?.toLowerCase() === region.toLowerCase()
    );
    console.log('Filtered customers:', filteredCustomers.length);
    console.log('Filtered customers details:', filteredCustomers);

    if (filteredCustomers.length === 0) {
      return NextResponse.json({ 
        error: `No customers found in ${region}` 
      }, { status: 404 });
    }

    // Use Gemini LLM to generate email content
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are a marketing expert that crafts compelling, personalized email content. Keep the tone professional but friendly.

Create a marketing email for ${product} targeting customers in ${region}. Include a compelling subject line and a clear call to action.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const emailContent = response.text();

    if (!emailContent) {
      return NextResponse.json({ 
        error: 'Failed to generate email content' 
      }, { status: 500 });
    }

    // If this is just a preview request, return the content
    if (previewOnly) {
      return NextResponse.json({ 
        emailContent,
        recipientCount: filteredCustomers.length 
      });
    }

    console.log('Starting to send emails to:', filteredCustomers.map((c: { email: string }) => c.email));

    // Send emails individually to each customer
    const emailPromises = filteredCustomers.map(async (customer: { email: string; name?: string }) => {
      try {
        console.log(`Attempting to send email to ${customer.email}`);
        // For testing: send to your email instead of customer email
        const result = await resend.emails.send({
          from: 'SynCRM <onboarding@resend.dev>',
          to: ['shriyanshdash12@gmail.com'], // Your email for testing
          subject: `[TEST] Special Offer on ${product} for ${region} Customers - ${customer.name}`,
          react: EmailTemplate({ 
            firstName: customer.name || 'Valued Customer',
            content: emailContent 
          }),
        });
        console.log(`Email sent successfully to ${customer.email}`, result);
        
        // Add delay after sending each email
        await delay(1000);
        
        return { success: true, data: result };
      } catch (error) {
        console.error(`Failed to send email to ${customer.email}:`, error);
        return { success: false, error, email: customer.email };
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    console.log('Email sending results:', results);

    // Count successful sends
    const successfulSends = results.filter(result => result.success).length;
    const failedSends = results.filter(result => !result.success).length;

    console.log(`Successful sends: ${successfulSends}, Failed sends: ${failedSends}`);

    if (successfulSends === 0) {
      return NextResponse.json({ 
        error: 'Failed to send any emails' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Emails sent successfully', 
      recipientCount: successfulSends,
      failedCount: failedSends,
      totalAttempted: filteredCustomers.length,
      results: results // Include detailed results in response
    });

  } catch (error) {
    console.error('Error crafting and sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to craft and send email' 
    }, { status: 500 });
  }
}
