// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from './navigation/BottomTabs';
import Login from './screens/Login';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userId, setUserId] = React.useState<number | null>(null);

  const handleLogin = (userId: number) => {
    setUserId(userId);
    setIsLoggedIn(true);
  };

  return (
    <NavigationContainer>
      {isLoggedIn && userId ? (
        <BottomTabs userId={userId} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}