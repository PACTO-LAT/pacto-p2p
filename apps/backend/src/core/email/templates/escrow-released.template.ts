export interface EscrowReleasedEmailData {
  recipientName?: string;
  role: 'buyer' | 'seller';
  engagementId: string;
  amount: number;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderEscrowReleasedEmail(
  data: EscrowReleasedEmailData
): RenderedEmail {
  const greeting = data.recipientName ? `Hola ${data.recipientName},` : 'Hola,';
  const line =
    data.role === 'buyer'
      ? `Los fondos de tu escrow ${data.engagementId} fueron liberados al vendedor.`
      : `Se liberaron los fondos del escrow ${data.engagementId}. La operación se completó.`;
  const subject = 'Pacto — Fondos liberados';
  const text = `${greeting}\n\n${line}\n\nMonto: ${data.amount}\n\n— Pacto`;
  const html = `<div style="font-family:sans-serif;color:#111">
  <p>${greeting}</p>
  <p>${line}</p>
  <p><strong>Monto:</strong> ${data.amount}</p>
  <p style="color:#059669">— Pacto</p>
</div>`;
  return { subject, html, text };
}
