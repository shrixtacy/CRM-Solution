interface InvoiceEmailProps {
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: Array<{
    name: string;
    sku: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}

export const InvoiceEmailTemplate = ({
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
}: InvoiceEmailProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const itemsHtml = items.map((item) => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 16px 24px; width: 35%;">
        <div style="font-size: 14px; font-weight: 500; color: #1f2937; margin: 0;">${item.name}</div>
      </td>
      <td style="padding: 16px 24px; width: 15%;">
        <div style="font-size: 12px; color: #6b7280; margin: 0; font-family: monospace;">${item.sku}</div>
      </td>
      <td style="padding: 16px 24px; width: 15%; text-align: right;">
        <div style="font-size: 14px; color: #374151; margin: 0;">${formatCurrency(item.price)}</div>
      </td>
      <td style="padding: 16px 24px; width: 10%; text-align: center;">
        <div style="font-size: 14px; color: #374151; margin: 0;">${item.quantity}</div>
      </td>
      <td style="padding: 16px 24px; width: 25%; text-align: right;">
        <div style="font-size: 14px; font-weight: 500; color: #1f2937; margin: 0;">${formatCurrency(item.total)}</div>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceNumber} from SynCRM</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; margin-bottom: 64px;">
        
        <!-- Header -->
        <div style="padding: 32px 24px; background-color: #1e40af; color: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; line-height: 1.2;">SynCRM</h1>
              <p style="color: #e5e7eb; font-size: 16px; margin: 8px 0 0;">Your Business Partner</p>
            </div>
            <div style="text-align: right;">
              <p style="color: #e5e7eb; font-size: 14px; font-weight: bold; margin: 0; letter-spacing: 1px;">INVOICE</p>
              <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 4px 0 0;">${invoiceNumber}</p>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <div>
              <p style="font-size: 14px; font-weight: bold; color: #374151; margin: 0 0 4px;">Bill To:</p>
              <p style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0;">${customerName}</p>
            </div>
            <div>
              <p style="font-size: 14px; font-weight: bold; color: #374151; margin: 0 0 4px;">Invoice Date:</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">${formatDate(invoiceDate)}</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="font-size: 14px; font-weight: bold; color: #374151; margin: 0 0 4px;">Due Date:</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">${formatDate(dueDate)}</p>
            </div>
            <div>
              <p style="font-size: 14px; font-weight: bold; color: #374151; margin: 0 0 4px;">Payment Method:</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">${paymentMethod.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="padding: 0 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; width: 35%;">Item</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; width: 15%;">SKU</th>
                <th style="padding: 12px 24px; text-align: right; font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; width: 15%;">Price</th>
                <th style="padding: 12px 24px; text-align: center; font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; width: 10%;">Qty</th>
                <th style="padding: 12px 24px; text-align: right; font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; width: 25%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="padding: 24px; background-color: #f9fafb; border-top: 2px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="text-align: right; padding-right: 16px;">
              <p style="font-size: 14px; font-weight: bold; color: #374151; margin: 0;">Subtotal:</p>
            </div>
            <div style="text-align: right; width: 120px;">
              <p style="font-size: 14px; color: #374151; margin: 0; font-weight: 500;">${formatCurrency(subtotal)}</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="text-align: right; padding-right: 16px;">
              <p style="font-size: 14px; font-weight: bold; color: #374151; margin: 0;">Tax (GST 18%):</p>
            </div>
            <div style="text-align: right; width: 120px;">
              <p style="font-size: 14px; color: #374151; margin: 0; font-weight: 500;">${formatCurrency(taxAmount)}</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 2px solid #1e40af; padding-top: 12px; margin-top: 8px;">
            <div style="text-align: right; padding-right: 16px;">
              <p style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0;">Total:</p>
            </div>
            <div style="text-align: right; width: 120px;">
              <p style="font-size: 18px; font-weight: bold; color: #1e40af; margin: 0;">${formatCurrency(total)}</p>
            </div>
          </div>
        </div>

        ${notes ? `
        <!-- Notes -->
        <div style="padding: 24px;">
          <p style="font-size: 14px; font-weight: bold; color: #374151; margin: 0 0 4px;">Notes:</p>
          <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0; line-height: 1.5;">${notes}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px; line-height: 1.5;">
            Thank you for your business! If you have any questions about this invoice, 
            please don't hesitate to contact us.
          </p>
          <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px; line-height: 1.5;">
            <strong>SynCRM</strong> - Your Business Partner
          </p>
          <p style="font-size: 12px; color: #6b7280; margin: 0; line-height: 1.5;">
            This is an automated invoice. Please keep this for your records.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
