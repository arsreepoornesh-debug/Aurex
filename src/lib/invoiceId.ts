import prisma from './prisma';

/**
 * Generates sequential Invoice Number formatted as: INV-AUR-YYYY-XXXX (e.g. INV-AUR-2026-0001)
 */
export async function generateInvoiceId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-AUR-${currentYear}-`;

  const lastPayment = await prisma.payment.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNumber: 'desc',
    },
    select: {
      invoiceNumber: true,
    },
  });

  let nextSequence = 1;
  if (lastPayment?.invoiceNumber) {
    const parts = lastPayment.invoiceNumber.split('-');
    if (parts.length === 4) {
      const seqNum = parseInt(parts[3], 10);
      if (!isNaN(seqNum)) {
        nextSequence = seqNum + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSeq}`;
}
