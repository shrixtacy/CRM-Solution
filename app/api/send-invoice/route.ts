import { Resend } from 'resend';
import { InvoiceEmailTemplate } from '@/components/invoice-email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      customerEmail, 
      customerName, 
      invoiceNumber, 
      invoiceDate, 
      dueDate, 
      items, 
      subtotal, 
      taxAmount, 
      total, 
      paymentMethod,
      notes 
    } = body;

    if (!customerEmail || !customerName || !invoiceNumber) {
      return Response.json({ 
        error: 'Missing required fields: customerEmail, customerName, invoiceNumber' 
      }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'SynCRM <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Invoice ${invoiceNumber} from SynCRM`,
      html: InvoiceEmailTemplate({
        customerName,
        invoiceNumber,
        invoiceDate,
        dueDate,
        items,
        subtotal,
        taxAmount,
        total,
        paymentMethod,
        notes
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      messageId: data?.id,
      message: 'Invoice email sent successfully' 
    });

  } catch (error) {
    console.error('Send invoice error:', error);
    return Response.json({ 
      error: 'Failed to send invoice email' 
    }, { status: 500 });
  }
}
