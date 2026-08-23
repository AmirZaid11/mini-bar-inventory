/**
 * Notification Service
 * dispatches notifications (like Telegram alerts) when stock drops below threshold.
 */

export async function sendLowStockTelegramAlert(
  itemName: string,
  currentQty: number,
  minStock: number,
  botToken: string,
  chatId: string
): Promise<boolean> {
  if (!botToken || !chatId) {
    console.warn('Telegram notifications skipped: Token or Chat ID not configured.');
    return false;
  }

  const message = `⚠️ *LOW STOCK ALERT*\n\n` +
    `Product: *${itemName}*\n` +
    `Current Quantity: *${currentQty}*\n` +
    `Minimum Alert Limit: *${minStock}*\n\n` +
    `Please restock immediately.`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Telegram notification error:', error);
    return false;
  }
}
