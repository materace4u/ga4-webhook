import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body;
  console.log('Webhook data:', data); // przyda się do debugowania

  const statusName = (data.status?.name || "").toLowerCase();
  const isPaid = data.paid !== undefined;
  const isStatusQualified = statusName.includes("opłacono") || statusName.includes("realizacji") || statusName.includes("wysłano");

  if (!isPaid && !isStatusQualified) {
    console.log('Pominięto zamówienie – brak odpowiedniego statusu.');
    return res.status(200).send({ info: 'Status nie kwalifikuje się jako konwersja.' });
  }

  const gclid = data.gclid || "555.666";

  const payload = {
    client_id: gclid,
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: data.id || data.order_id,
          value: parseFloat(data.total_brutto || data.sum || 0),
          currency: data.currency || data.currency_name || "PLN",
          items: (data.products || []).map(p => ({
            item_id: p.id || p.product_id,
            item_name: p.name,
            quantity: parseInt(p.quantity) || 1,
            price: parseFloat(p.price) || 0
          }))
        }
      }
    ],
    user_properties: {
      gclid: {
        value: gclid
      }
    }
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GA4 response error:', errorText);
      return res.status(500).send({ error: 'GA4 response error', details: errorText });
    }

    res.status(204).end(); // Brak treści = OK
  } catch (error) {
    console.error('GA4 error:', error);
    res.status(500).send({ error: 'GA4 exception', details: error.message });
  }
}

console.log("Webhook aktywny – test push do Vercel");
