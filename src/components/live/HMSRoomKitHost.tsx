import React from "react";
import { HMSPrebuilt } from "@100mslive/roomkit-react";

export default function HMSRoomKitHost({ token, userName }: { token: string; userName: string }) {
  return <HMSPrebuilt authToken={token} userName={userName} />;
} 