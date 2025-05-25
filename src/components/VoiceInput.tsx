
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onResult: (text: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          onResult(finalTranscript);
          toast({
            title: "Voice input captured!",
            description: finalTranscript,
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Please try again or check your microphone permissions.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  if (!isSupported) {
    return (
      <div className="text-center py-4">
        <Volume2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">
          Voice input is not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button
          type="button"
          variant={isListening ? "destructive" : "default"}
          size="lg"
          onClick={isListening ? stopListening : startListening}
          className="flex items-center space-x-2"
        >
          {isListening ? (
            <>
              <MicOff className="h-5 w-5" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              <span>Start Voice Input</span>
            </>
          )}
        </Button>
      </div>

      {isListening && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Listening...</span>
          </div>
        </div>
      )}

      {transcript && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Transcript:</p>
          <p className="text-gray-600">{transcript}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Try saying: "Spent $25 on office supplies" or "Received $100 for consulting"
      </div>
    </div>
  );
};
