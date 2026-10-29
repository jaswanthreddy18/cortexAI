import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../utils/axios';
import { auth, googleProvider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { setUserData } from '../redux/userSlice';
import ChatArea from '../components/ChatArea';
import SideBar from '../components/SideBar';
import LandingPage from './LandingPage';

const Home = ({ isCheckingSession }) => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const handleLogin = async (token) => {
    const { data } = await api.post("/api/auth/login", { token });
    dispatch(setUserData(data));
  }
  const googleLogin = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await handleLogin(token);
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  }

  if (isCheckingSession) {
    return <div className="grid min-h-screen place-items-center bg-[#f7f8fc] text-sm text-[#77748a]">Loading CortexAI…</div>;
  }

  if (!userData) {
    return <LandingPage onGoogleLogin={googleLogin} isSigningIn={isSigningIn} />;
  }

  return (
    <div className="app-shell fixed inset-0 z-50 flex text-[#28253c]">
      <SideBar />
      <ChatArea />
    </div>
  );
}

export default Home
