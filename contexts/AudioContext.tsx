"use client";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

interface Props {
  children: ReactNode;
}

interface IAudioContext {
  audioContext?: AudioContext;
  setAudioContext: Dispatch<SetStateAction<AudioContext | undefined>>;
}

const AudioContextContext = createContext<IAudioContext>({} as IAudioContext);

export default function AudioContextProvider({ children }: Props) {
  const [audioContext, setAudioContext] = useState<AudioContext>();

  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  return (
    <AudioContextContext.Provider value={{ audioContext, setAudioContext }}>
      {children}
    </AudioContextContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContextContext);
}
