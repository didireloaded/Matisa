import { AccessToken } from "https://esm.sh/livekit-server-sdk@1.2.7";

export const generateLiveKitToken = (
  roomName: string,
  participantIdentity: string,
  participantName: string,
) => {
  const at = new AccessToken(Deno.env.get("LIVEKIT_API_KEY"), Deno.env.get("LIVEKIT_API_SECRET"), {
    identity: participantIdentity,
    name: participantName,
  });
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
  return at.toJwt();
};
