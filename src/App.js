import React, {useState, useEffect} from 'react';
import { StompProvider } from './stomp';
import UserSetting from './SecondComponent';



export const App = () => {
  const [message, setMessage] = useState("default")
 const [stompClient, setStompClient] = useState(null);


  useEffect(() => {
    const socket = new SockJS('https://isw-psb-test-sc-superstore-sales-nano.azuremicroservices.io/websocket');
    const client = Stomp.over(socket);

    console.log('starting')

    client.connect({}, () => {
      client.subscribe('topic/websocket', (message) => {
        const receivedMessage = JSON.parse(message.body);
       console.log("received message: ", receivedMessage)
       handleMessageChange(receivedMessage);
      });
    });

    setStompClient(client);

    return () => {
      client.disconnect();
    };
  }, []);

  const handleNickNameChange = (e) => {
    setnickname(e.target.value);
  }

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  }

  const sendMessage = (chatmessage ) => {
   
     
      stompClient.send('/topic/websocket', {}, JSON.stringify(chatmessage));
      sendMessage('this is the beginning!');
      
  }

  return (
   <div>
    <StompProvider>
      <UserSetting />
    </StompProvider>
   </div>
   )
}

export default App
