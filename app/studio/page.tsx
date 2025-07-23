"use client"

import React, { useState, useRef, useEffect } from "react";
import { HandTracker } from "../components/HandTracker";
import { VoiceFX } from "../components/VoiceFX";
import { GestureType, EffectType } from "../hooks/useGestureControl";
import Link from "next/link";
import { webmBlobToWavBlob } from "../components/wavEncoder";

const EFFECTS = [
  {
    type: "normal" as EffectType,
    name: "Normal",
    description: "Clean, unprocessed voice.",
    gesture: "Open Hand",
    color: "var(--yellow)",
  },
  {
    type: "reverb" as EffectType,
    name: "Reverb",
    description: "Add echo and space to your voice.",
    gesture: "Fist",
    color: "var(--pink)",
  },
  {
    type: "layering" as EffectType,
    name: "Layering",
    description: "Record and loop your voice.",
    gesture: "Two Fingers",
    color: "var(--yellow)",
  },
  {
    type: "chorus" as EffectType,
    name: "Chorus",
    description: "Thick, layered sound with harmony.",
    gesture: "Three Fingers",
    color: "var(--peach)",
  },
];

export default function Studio() {
  // Simple state
  const [currentEffect, setCurrentEffect] = useState<EffectType>("normal");
  const [isActive, setIsActive] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  
  // Hand tracking state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [gestureName, setGestureName] = useState("No Gesture");
  const [gestureConfidence, setGestureConfidence] = useState(0);
  const [lastEffectChange, setLastEffectChange] = useState<number>(0);

  // Recording handler with flexible audio format support
  const handleRecordingComplete = async (audioBlob: Blob) => {
    console.log("STUDIO: Audio recording completed:", audioBlob.size, "bytes");
    console.log("STUDIO: Audio blob type:", audioBlob.type);
    
    if (audioBlob.size === 0) {
      setDownloadStatus("Recording failed - no audio captured");
      return;
    }
    
    setDownloadStatus("Downloading audio file...");
    
    try {
      // Determine file extension based on blob type
      let fileExtension = 'wav'
      if (audioBlob.type.includes('webm')) {
        fileExtension = 'webm'
      } else if (audioBlob.type.includes('mp4')) {
        fileExtension = 'm4a'
      } else if (audioBlob.type.includes('ogg')) {
        fileExtension = 'ogg'
      }
      
      console.log("STUDIO: Using file extension:", fileExtension);
      
      // Create download link for the audio file
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `singandwave-${currentEffect}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${fileExtension}`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("STUDIO: Audio download triggered successfully");
      setDownloadStatus(`${fileExtension.toUpperCase()} download completed!`);
      setTimeout(() => setDownloadStatus(""), 3000);
    } catch (error) {
      console.error("STUDIO: Audio download error:", error);
      setDownloadStatus("Download failed - " + (error instanceof Error ? error.message : 'Unknown error'));
      setTimeout(() => setDownloadStatus(""), 5000);
    }
  };

  // Improved gesture handling with debouncing
  const handleGestureChange = (gesture: GestureType) => {
    const now = Date.now();
    const timeSinceLastChange = now - lastEffectChange;
    
    // Increased debounce to prevent audio cuts from frequent changes
    if (timeSinceLastChange < 150) { // Increased to 150ms to prevent audio cuts
      console.log("STUDIO: Skipping effect change - too soon since last change");
      return;
    }
    
    let newEffect: EffectType = "normal";
    
    switch (gesture) {
      case "open_hand":
        newEffect = "normal";
        break;
      case "fist":
        newEffect = "reverb";
        break;
      case "two_fingers":
        newEffect = "layering";
        break;
      case "three_fingers":
        newEffect = "chorus";
        break;
      case "swipe_down":
        newEffect = "normal";
        break;
      default:
        newEffect = "normal";
    }
    
    // Only update if the effect actually changed
    if (newEffect !== currentEffect) {
      console.log(`STUDIO: Effect changing from ${currentEffect} to ${newEffect} (gesture: ${gesture})`);
      setCurrentEffect(newEffect);
      setLastEffectChange(now);
    }
  };

  const handleCameraToggle = (isOn: boolean) => {
    setIsCameraActive(isOn);
  };

  // Simple start/stop function
  const handleStartStop = () => {
    if (!isActive) {
      setIsActive(true);
      setIsCameraActive(true);
    } else {
      setIsActive(false);
      setIsCameraActive(false);
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav
        style={{
          background: "var(--black)",
          color: "var(--white)",
          width: "100%",
          padding: "1rem 0",
          borderBottom: "3px solid var(--peach)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span className="logo-script" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--white)" }}>
            Sing & Wave
          </span>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link href="/" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--white)", color: "var(--black)" }}>
              Home
            </Link>
            <Link href="/effects" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--white)", color: "var(--black)" }}>
              Effects
            </Link>
            <Link href="/studio" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--peach)", color: "var(--black)" }}>
              Studio
            </Link>
            <Link href="/about" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--white)", color: "var(--black)" }}>
              About
            </Link>
            <Link href="/test-audio" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--white)", color: "var(--black)" }}>
              Test Audio
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        style={{
          maxWidth: 1100,
          margin: "2.5rem auto",
          padding: "0 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Studio Controls */}
        <section
          style={{
            background: "var(--yellow)",
            border: "3px solid var(--black)",
            borderRadius: "1.5rem",
            padding: "2rem",
            marginBottom: "1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
          }}
        >
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center" }}>
            Studio Controls
          </h3>
          
          {/* Start/Stop Button */}
          <button
            onClick={handleStartStop}
            style={{
              padding: "1.5rem 3rem",
              fontSize: "1.5rem",
              fontWeight: "bold",
              background: isActive ? "#dc2626" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "1rem",
              cursor: "pointer",
              minWidth: "200px"
            }}
          >
            {isActive ? "Stop Studio" : "Start Studio"}
          </button>
          
          {/* Effect Selector */}
          
          {/* Download Status */}
          {downloadStatus && (
            <div style={{
              padding: "1rem",
              background: "var(--pink)",
              borderRadius: "0.75rem",
              border: "2px solid var(--black)",
              textAlign: "center",
              fontWeight: "600"
            }}>
              {downloadStatus}
            </div>
          )}
          {isActive && (
            <div style={{ 
              display: "flex", 
              gap: "1rem", 
              justifyContent: "center", 
              marginTop: "1rem",
              flexWrap: "wrap"
            }}>
              {(["normal", "reverb", "chorus", "layering"] as EffectType[]).map((effect) => (
                <button
                  key={effect}
                  onClick={() => {
                    console.log(`STUDIO: Manual effect change to ${effect}`);
                    setCurrentEffect(effect);
                    setLastEffectChange(Date.now());
                  }}
                  style={{
                    padding: "0.8rem 1.5rem",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    background: currentEffect === effect ? "#2196F3" : "#e0e0e0",
                    color: currentEffect === effect ? "white" : "black",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer"
                  }}
                >
                  {effect.charAt(0).toUpperCase() + effect.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Status Display */}
          <div style={{ 
            background: "#f5f5f5", 
            padding: "1rem", 
            borderRadius: "0.5rem", 
            marginTop: "1rem",
            textAlign: "center",
            width: "100%"
          }}>
            <p><strong>Status:</strong> {isActive ? "Studio Active" : "Studio Paused"}</p>
            {isActive && (
              <>
                <p><strong>Effect:</strong> {currentEffect.charAt(0).toUpperCase() + currentEffect.slice(1)}</p>
                <p><strong>Gesture:</strong> {gestureName} ({Math.round(gestureConfidence * 100)}%)</p>
                {downloadStatus && (
                  <p style={{ color: downloadStatus.includes("failed") ? "#dc2626" : "#059669", fontWeight: "600" }}>
                    <strong>Download:</strong> {downloadStatus}
                  </p>
                )}
                <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
                  Recording captures processed audio with effects applied
                </p>
                <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>
                  Effects now have smoother transitions and better audio quality
                </p>
              </>
            )}
          </div>
        </section>

        {/* Main Studio Interface */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginBottom: "1.5rem",
            width: "100%",
          }}
        >
          {/* Left: Voice Processing */}
          <div
            style={{
              background: "var(--pink)",
              border: "3px solid var(--black)",
              borderRadius: "1.5rem",
              padding: "2rem",
            }}
          >
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>Voice Processing</h3>
            <VoiceFX
              currentEffect={currentEffect}
              isActive={isActive}
              onRecordingComplete={handleRecordingComplete}
            />
          </div>

          {/* Right: Camera Feed */}
          <div
            style={{
              background: "var(--yellow)",
              border: "3px solid var(--black)",
              borderRadius: "1.5rem",
              padding: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isCameraActive ? (
              <HandTracker
                onGestureChange={handleGestureChange}
                isActive={isCameraActive}
                onCameraToggle={handleCameraToggle}
                onGestureFeedback={({ icon, name, confidence }) => {
                  setGestureName(name);
                  setGestureConfidence(confidence);
                }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#666" }}>
                <div style={{ fontSize: "1rem" }}>Camera will start with studio</div>
              </div>
            )}
          </div>
        </section>

        {/* Gesture Status */}
        {isCameraActive && (
          <section
            style={{
              background: "var(--peach)",
              border: "3px solid var(--black)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              marginBottom: "1.5rem",
              width: "100%",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem", textAlign: "center" }}>
              Gesture Control
            </h3>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "2rem",
              flexWrap: "wrap"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--black)" }}>
                  {gestureName}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {gestureConfidence > 0 ? `${Math.round(gestureConfidence * 100)}% confidence` : "No gesture detected"}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--black)" }}>
                  Active Effect
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {currentEffect.charAt(0).toUpperCase() + currentEffect.slice(1)}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Effects Guide */}
        <section
          style={{
            background: "var(--white)",
            border: "3px solid var(--black)",
            borderRadius: "1.5rem",
            padding: "2rem",
            marginBottom: "1.5rem",
            width: "100%",
          }}
        >
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", textAlign: "center" }}>
            Gesture Controls
          </h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "1rem" 
          }}>
            {EFFECTS.map((effect) => (
              <div
                key={effect.type}
                style={{
                  padding: "1rem",
                  background: effect.color,
                  borderRadius: "0.75rem",
                  border: "2px solid var(--black)",
                  textAlign: "center"
                }}
              >
                <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                  {effect.name}
                </h4>
                <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                  {effect.description}
                </p>
                <p style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                  Gesture: {effect.gesture}
                  {effect.type === 'layering' && (
                    <span style={{ fontSize: "0.7rem", display: "block", marginTop: "0.25rem", color: "#666" }}>
                      (index + pinky)
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
} 