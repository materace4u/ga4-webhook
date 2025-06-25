import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body;

  const payload = {
    client_id: "555.666",
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: data.order_id,
          value: parseFloat(data.sum),
          currency: data.currency_name || "PLN",
          items: data.products.map((p) => ({
            item_id: p.product_id,
            item_name: p.name,
            quantity: parseInt(p.quantity),
            price: parseFloat(p.price)
          }))
        }
      }
    ]
  };

  try {
    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=G-876L7W6JRX&api_secret=ScYpGfr5Qt61cU36KC2ZsA`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'GA4 error' });
  }
}
