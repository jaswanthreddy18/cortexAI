import Home from './pages/Home';
import { useEffect, useState } from 'react';
import getCurrentUser from './features/getCurrentUser';
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice';
const App = () => {
  const dispatch = useDispatch();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await getCurrentUser();
        dispatch(setUserData(data));
      } finally {
        setIsCheckingSession(false);
      }
    }
    getUser();
  }, [dispatch]);
  return (
    <>
      <Home isCheckingSession={isCheckingSession} />
    </>
  )
}

export default App
