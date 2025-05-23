"use client";

import { useMicVAD } from "@ricky0123/vad-react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface MicButtonProps {
  uploadAudio: (audio: Float32Array<ArrayBufferLike>) => void;
}

export default function MicButton({uploadAudio}: MicButtonProps) {
  const vad = useMicVAD({
    startOnLoad: false,
    redemptionFrames: 30,
    onSpeechEnd: (audio) => {
      uploadAudio(audio);
      console.log("User stopped talking");
    },
  });

  return (
    <Button
      size="lg"
      variant={vad.listening ? "destructive" : "default"}
      className={cn(
        "h-16 w-16 rounded-full p-0",
        !vad.listening && "bg-primary-400 hover:bg-primary-500",
      )}
      onClick={() => vad.toggle()}
    >
      {vad.listening ? (
        <Mic className="h-6 w-6" />
      ) : (
        <MicOff className="h-6 w-6" />
      )}
    </Button>
  );
}