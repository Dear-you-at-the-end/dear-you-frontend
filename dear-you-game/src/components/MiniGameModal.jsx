import React, { useEffect, useState, useRef } from "react";

const MiniGameModal = ({ isOpen, onClose, onWin }) => {
  const [volume, setVolume] = useState(0);
  const [message, setMessage] = useState("소리를 질러보세요!");
  const [permission, setPermission] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const rafIdRef = useRef(null);

  const WIN_THRESHOLD = 50;

  useEffect(() => {
    if (!isOpen) return;

    // Define functions inside useEffect to avoid "use before define" issues and capture dependencies correctly
    const handleWin = () => {
      setMessage("성공! 대단한 성량입니다!");
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      setTimeout(() => {
        onWin();
        onClose();
      }, 2000);
    };

    const detectVolume = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const array = dataArrayRef.current;
      let sum = 0;
      for (let i = 0; i < array.length; i++) {
        sum += array[i];
      }
      const average = sum / array.length;

      const normalizedVolume = Math.min(100, (average / 128) * 100);

      setVolume(normalizedVolume);

      if (normalizedVolume > WIN_THRESHOLD) {
        handleWin();
        return;
      }

      rafIdRef.current = requestAnimationFrame(detectVolume);
    };

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setPermission(true);

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        sourceRef.current = source;

        detectVolume();
      } catch (err) {
        console.error("Microphone access denied:", err);
        setMessage("마이크 권한이 필요합니다.");
      }
    };

    initAudio();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (sourceRef.current) sourceRef.current.disconnect();
    };
  }, [isOpen, onClose, onWin]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          width: "400px",
          height: "300px",
          backgroundImage: "url('/assets/common/Setting menu.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          color: "white",
          imageRendering: "pixelated",
        }}
      >
        <h2 style={{ marginBottom: "20px", textShadow: "2px 2px 0 #000" }}>
          {message}
        </h2>

        {permission && (
          <div
            style={{
              width: "200px",
              height: "30px",
              border: "2px solid white",
              marginBottom: "20px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${Math.min(volume, 100)}%`,
                height: "100%",
                backgroundColor: volume > WIN_THRESHOLD ? "green" : "red",
                transition: "width 0.1s linear",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${WIN_THRESHOLD}%`,
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: "yellow",
              }}
            />
          </div>
        )}

        <div
          onClick={onClose}
          style={{
            cursor: "pointer",
            padding: "10px 20px",
            backgroundImage: "url('/assets/common/Square Buttons 26x19.png')",
            backgroundSize: "cover",
            imageRendering: "pixelated",
            color: "black",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          닫기
        </div>
      </div>
    </div>
  );
};

export default MiniGameModal;
