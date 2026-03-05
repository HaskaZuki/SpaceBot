import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import config from '../config';
const SocketContext = createContext(null);
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [playerState, setPlayerState] = useState({
    currentTrack: null,
    isPlaying: false,
    queue: [],
    progress: 0,
    duration: 0,
    volume: 100
  });
  useEffect(() => {
    const newSocket = io(config.socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    newSocket.on('connect', () => {
      setConnected(true);
    });
    newSocket.on('disconnect', () => {
      setConnected(false);
    });
    newSocket.on('playerState', (state) => {
      setPlayerState(state);
    });
    newSocket.on('queueUpdate', (queue) => {
      setPlayerState(prev => ({ ...prev, queue }));
    });
    newSocket.on('trackStart', (track) => {
      setPlayerState(prev => ({
        ...prev,
        currentTrack: track,
        isPlaying: true,
        progress: 0
      }));
    });
    newSocket.on('trackEnd', () => {
      setPlayerState(prev => ({
        ...prev,
        currentTrack: null,
        isPlaying: false,
        progress: 0
      }));
    });
    newSocket.on('progressUpdate', ({ progress, duration }) => {
      setPlayerState(prev => ({
        ...prev,
        progress,
        duration
      }));
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);
  const joinGuild = useCallback((guildId) => {
    if (socket && guildId) {
      socket.emit('joinGuild', guildId);
    }
  }, [socket]);
  const playPause = useCallback(() => {
    if (socket) {
      socket.emit('playPause');
    }
  }, [socket]);
  const skip = useCallback(() => {
    if (socket) {
      socket.emit('skip');
    }
  }, [socket]);
  const previous = useCallback(() => {
    if (socket) {
      socket.emit('previous');
    }
  }, [socket]);
  const seek = useCallback((position) => {
    if (socket) {
      socket.emit('seek', position);
    }
  }, [socket]);
  const setVolume = useCallback((volume) => {
    if (socket) {
      socket.emit('setVolume', volume);
      setPlayerState(prev => ({ ...prev, volume }));
    }
  }, [socket]);
  const addToQueue = useCallback((query) => {
    if (socket) {
      socket.emit('addToQueue', query);
    }
  }, [socket]);
  const removeFromQueue = useCallback((index) => {
    if (socket) {
      socket.emit('removeFromQueue', index);
    }
  }, [socket]);
  const clearQueue = useCallback(() => {
    if (socket) {
      socket.emit('clearQueue');
    }
  }, [socket]);
  const shuffle = useCallback(() => {
    if (socket) {
      socket.emit('shuffle');
    }
  }, [socket]);
  const toggleLoop = useCallback(() => {
    if (socket) {
      socket.emit('toggleLoop');
    }
  }, [socket]);
  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      playerState,
      joinGuild,
      playPause,
      skip,
      previous,
      seek,
      setVolume,
      addToQueue,
      removeFromQueue,
      clearQueue,
      shuffle,
      toggleLoop
    }}>
      {children}
    </SocketContext.Provider>
  );
}
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
