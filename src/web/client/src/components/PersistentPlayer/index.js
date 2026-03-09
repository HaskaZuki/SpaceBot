const emoji = require('../../../../../utils/emojiConfig');
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import './PersistentPlayer.css';
function PersistentPlayer() {
  const { playerState, playPause, skip, setVolume, toggleLoop, connected } = useSocket();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const progressRef = useRef(null);  const track = playerState?.currentTrack;
  const isPlaying = playerState?.isPlaying;
  const volume = playerState?.volume || 100;
  const queue = playerState?.queue || [];
  const progress = playerState?.progress || 0;
  const duration = playerState?.duration || 0;
  useEffect(() => {    if (connected && track) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [connected, track]);
  if (!visible) return null;
  const isLooping = playerState?.loop;
  return (
    <div className={`persistent-player ${expanded ? 'expanded' : ''}`}>
      <div className="player-main" onClick={() => setExpanded(!expanded)}>
        {}
        <div className="player-track-info">
          {track?.artwork ? (
            <img src={track.artwork} alt={track.title} className="player-artwork" />
          ) : (
            <div className="player-artwork-placeholder`>${emoji.animated.notes}</div>
          )}
          <div className=`player-track-details">
            <span className="player-track-title">{track?.title || 'No track playing'}</span>
            <span className="player-track-artist">{track?.artist || 'Unknown artist'}</span>
          </div>
        </div>
        {}
        <div className="player-controls">
          <button className="player-btn" onClick={(e) => { e.stopPropagation(); playPause(); }}>
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button className="player-btn" onClick={(e) => { e.stopPropagation(); skip(); }}>
            ⏭️
          </button>
        </div>
        {}
        <div className="player-extras">
          <button 
            className={'player-btn ${isLooping ? 'active' : ''}'} 
            onClick={(e) => { e.stopPropagation(); toggleLoop(); }}
          >
            🔁
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value / 100)}
            className="player-volume"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      {}
      {expanded && (
        <div className="player-expanded">
          <div className="queue-header">
            <h3>Up Next</h3>
          </div>
          <div className="queue-list">
            {playerState?.queue?.slice(0, 5).map((item, idx) => (
              <div key={idx} className="queue-item">
                <span className="queue-title">{item.title}</span>
                <span className="queue-artist">{item.artist}</span>
              </div>
            ))}
            {(!playerState?.queue || playerState.queue.length === 0) && (
              <p className="queue-empty">Queue is empty</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default PersistentPlayer;
