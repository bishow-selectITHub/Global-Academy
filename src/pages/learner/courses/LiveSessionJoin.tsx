
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { HMSPrebuilt } from '@100mslive/roomkit-react';

const LiveSessionJoin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || (location.state as any)?.token;
  const userName = searchParams.get('userName') || (location.state as any)?.userName;

  if (!token || !userName) {
    setTimeout(() => navigate(-1), 0);
    return <div style={{ padding: 20 }}>Missing token or user name.</div>;
  }

  const Prebuilt: any = HMSPrebuilt as unknown as any;
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Prebuilt authToken={token} userName={String(userName)} />
    </div>
  );
};

export default LiveSessionJoin;