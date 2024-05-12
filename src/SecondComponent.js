

import React, { useState, useEffect, useContext } from 'react';

import { StompContext, StompEventTypes, StompProvider, useStomp} from './stomp';


const UserSetting = () => {
    const [status, setStatus] = useState('Not Connected');
    const [session, setSession] = useState(null);

    const { newStompClient, addStompEventListener, removeStompEventListener, publicMessage, privateMessage } = useContext(StompContext);
   
    const EventPropType = {
            eventId: "",
            from: "dauda",
            to: "oziegbe",
            eventDt: "",
            payload: "drizzy got bodied by a short nicca"
          }

  useEffect(() => {
    const connectListener = () => setStatus('Connected');
    const disconnectListener = () => setStatus('Disconnected');
    const webSocketCloseListener = () => setStatus('Disconnected (not graceful)');

   addStompEventListener(StompEventTypes.Connect, connectListener);
   addStompEventListener(StompEventTypes.Disconnect, disconnectListener);
   addStompEventListener(StompEventTypes.WebSocketClose, webSocketCloseListener);

    setSession(newStompClient(
      'http://localhost:8080/websocket',
      {
        Authorization: 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3Iiwicm9sZSI6IlNUT1JFX0FETUlOIiwibWVyY2hhbnRJZCI6NCwiaGFyZHdhcmVJZCI6IlVOS05PV04iLCJwZXJtaXNzaW9ucyI6W10sIm1vYmlsZSI6IjIzNDgxMjQzMzk5MTEiLCJleHAiOjE3MTU5NTczODUsInN0b3JlSWQiOjYsImlhdCI6MTcxNTM1MjU4NSwiZW1haWwiOiJoZW5zb24uY2hyaXNAZ21haWwuY29tIn0.VnVcM3KP6fwEXFwIbMQbeGYNeem9oQy3MzLjRqjBECWHTbXNJoEXaE7H0NdbfaG5hdGNl4wguqTpnWSBTQUe5MGyTeLRBNVYfg0f-d6vrnYsbOFP5mbA_epn3qhAcNXpcRy1HtG3aVSd-YGQqV8mSbGj5xhzT0pVwYRsys7gyuwMs8YUoo327Ui1kS21SPqfDn2gaCml_hXSmi5_7h0p87C20vSEhIkTacEcNkumOByJ3ATlSmabWrhfqHS_b_i3DE0SKAYkDXHjuAQP9xwvi6fPsr5sLDpPo6UnRak49YgWYxfc1QFk1ql0KhJtUyYsX0kzkJHIzc5j6OjkxM_RcIJ0U4T8PHkqfDTUckLcnQv8mKBBeN-BwabS83CjZsMtBtlwkCh4gSVnqffenqDJB2EenFUl1dV-1VX2wd_VGrxjzdsyU19eez6ucS-S0uH1eAx2u4vgVYciJw9ZMTEl1FqJix6B_yLOOLCtPokohSpTPSE35fkFZwKwcbl5WMLsdUIeTUFlmIyXf3uUmBlT569QWGN1vj4y-XTTnyhSyaglLr_uG8LJCfC_kK-YBQhAhL9ZueazLvS8T1G6g2LNmFs4AmMEsL3UqxazpgZNap0Yp5B9R5Nng13YUwakiMI0UCEW1Acacd7jwMCBJaRKEvJgq7BDu4Un8YxZI9764wg',
        userId: '123',
      },
      '/host'
    ));

   

   

    // Cleanup
    return () => {
      removeStompEventListener(StompEventTypes.Connect, connectListener);
      removeStompEventListener(StompEventTypes.Disconnect, disconnectListener);
      removeStompEventListener(StompEventTypes.WebSocketClose, webSocketCloseListener);
    };
  }, []);

  


  const handleSendPrivateMessage = () => {
    console.log("sending to private user");
     session.publish({
        destination: '/user/my-email/queue/private',
        body: JSON.stringify(EventPropType),
    });

  }

  const handleSendMessage = () => {
    console.log('sending message.......');
    
 
    session.publish({
      destination: '/app/sendmessage',
      body: JSON.stringify(EventPropType),
  });
   
  }

   
      
    return (
      <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <div style={{margin:10}}><span>Status: {status}</span></div>
        <div style={{margin:10}}><h4>Public message: {publicMessage}</h4></div>
        <div style={{margin:10}}><span>Private message: {privateMessage}</span></div>
        <button onClick={handleSendMessage} style={{backgroundColor:'blue'}} > public</button>
        <button onClick={handleSendPrivateMessage} style={{backgroundColor:'blue'}}> private</button>
      </div>
    )


}

export default UserSetting;