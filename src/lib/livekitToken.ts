import { SignJWT } from 'jose';

// Warning: In production, tokens MUST be generated on the server.
// Doing it on the client exposes your LIVEKIT_API_SECRET.
export async function generateLiveKitToken(roomName: string, participantName: string, participantIdentity: string) {
  const apiKey = import.meta.env.VITE_LIVEKIT_API_KEY;
  const apiSecret = import.meta.env.VITE_LIVEKIT_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit API key or secret is missing.');
  }

  const secretKey = new TextEncoder().encode(apiSecret);

  // LiveKit JWT payload structure
  const payload = {
    video: {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    },
    name: participantName,
  };

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(apiKey)
    .setSubject(participantIdentity)
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secretKey);

  return jwt;
}
