
import React, { createContext, useContext, useState } from 'react';
import EventEmitter from 'eventemitter3';
import PropTypes from 'prop-types';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

if (typeof TextEncoder !== 'function') {
    const TextEncodingPolyfill = require('text-encoding');
    TextEncoder = TextEncodingPolyfill.TextEncoder;
    TextDecoder = TextEncodingPolyfill.TextDecoder;
}

const logger = console; // Use any logger you want here
const stompEvent = new EventEmitter();

const StompEventTypes = {
    Connect: 0,
    Disconnect: 1,
    Error: 2,
    WebSocketClose: 3,
    WebSocketError: 4,
};

export const StompContext = createContext();

export const useStomp = () => useContext(StompContext);

const StompProvider = ({ children }) => {
    const[publicMessage, setPublic] = useState('');
    const[privateMessage, setPrivate] = useState('');

    const newStompClient = (url, headers, host) => {
        logger.log('Stomp trying to connect', url, headers, host);
       
        let _stompClient = new Client({
            brokerURL: url,
            connectHeaders: { ...headers, host },
            debug: (str) => {
                logger.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            logRawCommunication: false,
            webSocketFactory: () => SockJS(url),
            onStompError: (frame) => {
                logger.log('Stomp Error', frame);
                stompEvent.emit(StompEventTypes.Error, frame);
            },
            onConnect: (frame) => {
                logger.log('Stomp Connect', frame);
                _stompClient.subscribe('/topic/public', (message) =>{
                    logger.log(`Received: ${message.body}`)
                    setPublic(JSON.stringify(message.body));
                }
                );

                _stompClient.subscribe('/user/queue/private', (message) =>{
                    logger.log(`Received: ${message.body}`)
                    setPrivate(JSON.stringify(message.body));
                }
                );

              
                stompEvent.emit(StompEventTypes.Connect, frame);
                
            },
            onDisconnect: (frame) => {
                logger.log('Stomp Disconnect', frame);
                stompEvent.emit(StompEventTypes.Disconnect, frame);
            },
            onWebSocketClose: (frame) => {
                logger.log('Stomp WebSocket Closed', frame);
                stompEvent.emit(StompEventTypes.WebSocketClose, frame);
            },
            onWebSocketError: (frame) => {
                logger.log('Stomp WebSocket Error', frame);
                stompEvent.emit(StompEventTypes.WebSocketError, frame);
            },
    
        });

        _stompClient.activate();

        return _stompClient;
    };

    const removeStompClient = () => {
        logger.log('Stomp trying to disconnect');
        if (newStompClient) {
            newStompClient.deactivate();
            newStompClient = null;
        }
    };

    const addStompEventListener = (eventType, emitted, context, isOnce) => {
        if (isOnce) {
            stompEvent.once(eventType, emitted, context);
        } else {
            stompEvent.on(eventType, emitted, context);
        }
    };

    const removeStompEventListener = (eventType, emitted, context) => {
        stompEvent.removeListener(eventType, emitted, context);
    };

    const getStompClient = () => newStompClient;


    const stompContextValue = {
        getStompClient,
        newStompClient,
        removeStompClient,
        addStompEventListener,
        removeStompEventListener,
    };

    return (
        <StompContext.Provider value={{
            newStompClient,
            removeStompClient,
            addStompEventListener,
            removeStompEventListener,
            publicMessage,
            privateMessage
          }}>
            {children}
        </StompContext.Provider>
    );
};

StompProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { StompEventTypes, StompProvider };
