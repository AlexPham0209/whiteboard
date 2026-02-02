import { useEffect, useState } from 'react'
import socket from './socket';
import axios from 'axios';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    axios.get('http://localhost:3000/api').then(
      (res) => console.log(res.data)
    );

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <div>
    
    </div>
  )
}

export default App
