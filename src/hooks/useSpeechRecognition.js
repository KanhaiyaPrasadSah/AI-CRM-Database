import { useEffect, useRef, useState } from "react";

const useSpeechRecognition = (
  selectedLanguage = "en-US",
  onFinalTranscript,
  onInterimTranscript
) => {
  const [isListening, setIsListening] =
    useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn(
        "Speech Recognition not supported"
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (err) => {
      console.error(
        "Speech Error:",
        err
      );

      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (
          event.results[i].isFinal
        ) {
          finalTranscript +=
            transcript;
        } else {
          interimTranscript +=
            transcript;
        }
      }

      if (
        interimTranscript &&
        onInterimTranscript
      ) {
        onInterimTranscript(
          interimTranscript
        );
      }

      if (
        finalTranscript &&
        onFinalTranscript
      ) {
        onFinalTranscript(
          finalTranscript
        );
      }
    };

    recognitionRef.current =
      recognition;

    return () => {
      recognition.stop();
    };
  }, [
    selectedLanguage,
    onFinalTranscript,
    onInterimTranscript,
  ]);

  const startListening = () => {
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.log(
        "Recognition already running"
      );
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  return {
    isListening,
    startListening,
    stopListening,
  };
};

export default useSpeechRecognition;