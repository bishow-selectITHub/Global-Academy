import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { roomName, description } = req.body;
    const response = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HMS_MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        description,
    
      }),
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || 'Unknown error' };
    }
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
} 