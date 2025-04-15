import { useEffect, useRef } from "react";

interface InvisibleAudioPlayerProps {
  audioUrl: string;
}

const InvisibleAudioPlayer: React.FC<InvisibleAudioPlayerProps> = ({ audioUrl }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioEl = audioRef.current;

    if (audioEl && audioUrl) {
      // Stop previous playback
      audioEl.pause();
      audioEl.src = audioUrl;
      audioEl.load();

      // Play new audio
      audioEl.play().catch(err => {
        console.error("Playback failed:", err);
      });
    }
  }, [audioUrl]);

  return <audio ref={audioRef} controls className="hidden" />;
};

export default InvisibleAudioPlayer;
