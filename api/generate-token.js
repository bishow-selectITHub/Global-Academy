// /api/generate-token.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { user_id, role, room_id } = req.body;

  const response = await fetch('https://api.100ms.live/v2/room-tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HMS_MANAGEMENT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id,
      role:"host", 
      room_id,
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
