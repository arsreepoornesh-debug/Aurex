import prisma from './prisma';

/**
 * Generates the next sequential Client ID formatted as: AUR-YYYY-XXXX (e.g. AUR-2026-0001)
 */
export async function generateClientId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `AUR-${currentYear}-`;

  const lastClient = await prisma.client.findFirst({
    where: {
      clientId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      clientId: 'desc',
    },
    select: {
      clientId: true,
    },
  });

  let nextSequence = 1;
  if (lastClient?.clientId) {
    const parts = lastClient.clientId.split('-');
    if (parts.length === 3) {
      const seqNum = parseInt(parts[2], 10);
      if (!isNaN(seqNum)) {
        nextSequence = seqNum + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSeq}`;
}
