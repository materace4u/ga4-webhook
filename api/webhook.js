import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body;
  console.log('Webhook data:', data); // przyda się do debugowania w logach Vercel

  const payload = {
    client_id: "555.666", // możesz wygenerować dynamicznie, jeśli chcesz
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: data.id || data.order_id,
          value: parseFloat(data.total_brutto || data.sum || 0),
          currency: data.currency || "PLN",
          items: (data.products || []).map(p => ({
            item_id: p.id || p.product_id,
            item_name: p.name,
            quantity: parseInt(p.quantity) || 1,
            price: parseFloat(p.price) || 0
          }))
        }
      }
    ]
  };

  try {
    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    res.status(204).end();
  } catch (error) {
    console.error('GA4 error:', error);
    res.status(500).send({ error: 'GA4 error' });
  }
}
