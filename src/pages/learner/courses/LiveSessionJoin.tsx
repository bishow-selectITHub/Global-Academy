import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHMSActions, useHMSStore, selectIsConnectedToRoom, selectPeers, selectVideoTrackByPeerID } from '@100mslive/react-sdk';

const PeerVideo = ({ peer }: { peer: any }) => {
  const videoTrack = useHMSStore(selectVideoTrackByPeerID(peer.id));
  return (
    <div style={{ width: 200, height: 150, background: '#222', margin: 8 }}>
      <div>{peer.name}</div>
      {videoTrack?.enabled ? (
        <video
          autoPlay
          playsInline
          ref={ref => {
            if (ref && videoTrack?.track) {
              ref.srcObject = videoTrack.track;
            }
          }}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div style={{ color: '#fff' }}>No Video</div>
      )}
    </div>
  );
};

const LiveSessionJoin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, userName } = location.state || {};
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);

  useEffect(() => {
    if (!token || !userName) {
      alert('Missing token or user name');
      navigate(-1);
      return;
    }
    if (!isConnected) {
      hmsActions.join({ userName, authToken: token });
    }
  }, [token, userName, isConnected, hmsActions, navigate]);

  if (!isConnected) {
    return <div>Joining the live session...</div>;
  }

  return (
    <div>
      <h2>Live Session</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {peers.map(peer => (
          <PeerVideo key={peer.id} peer={peer} />
        ))}
      </div>
    </div>
  );
};

export default LiveSessionJoin; 