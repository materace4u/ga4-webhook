import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { gclid, email } = req.body;

  if (!gclid || !email) {
    return res.status(400).json({ error: 'Missing gclid or email' });
  }

  const dbPath = path.resolve('./gclid-db.json');

  let db = {};
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }

  db[email] = gclid;

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`Zapisano GCLID: ${gclid} dla emaila: ${email}`);

  res.status(200).json({ success: true });
}
