"use client"

import React, { useState } from "react";
import { EffectType } from "../hooks/useGestureControl";
import Link from "next/link";

const EFFECTS = [
  {
    type: "normal" as EffectType,
    name: "Normal",
    description: "Clean, unprocessed voice with no effects applied.",
    longDescription: "Your voice as it naturally sounds, with crystal clear audio quality. Perfect for speaking, singing, or any vocal performance where you want to maintain the original character of your voice.",
    gesture: "Open Hand",
    color: "var(--yellow)",
    icon: "MIC",
  },
  {
    type: "reverb" as EffectType,
    name: "Reverb",
    description: "Add echo and space to your voice for a room-like effect.",
    longDescription: "Creates the illusion of singing in a large space. Adds depth and atmosphere to your voice, making it sound like you're performing in a concert hall or cathedral.",
    gesture: "Fist",
    color: "var(--pink)",
    icon: "ECHO",
  },
  {
    type: "chorus" as EffectType,
    name: "Chorus",
    description: "Thick, layered sound that adds harmony and richness.",
    longDescription: "Creates a subtle doubling effect that makes your voice sound fuller and more harmonically rich. Great for adding depth to vocal performances without being too obvious.",
    gesture: "Three Fingers",
    color: "var(--peach)",
    icon: "CHORUS",
  },
  {
    type: "layering" as EffectType,
    name: "Layering",
    description: "Record and loop your voice to create harmonies.",
    longDescription: "Record short phrases that automatically loop, allowing you to build up harmonies and create complex vocal arrangements. Perfect for creating backing vocals or atmospheric soundscapes.",
    gesture: "Two Fingers",
    color: "var(--yellow)",
    icon: "LOOP",
  },
  {
    type: "normal" as EffectType, // Using normal as the "stop all" effect
    name: "Stop All FX",
    description: "Stop all effects and return to clean voice.",
    longDescription: "Instantly stops all voice effects and returns your voice to its natural, unprocessed state. Use this when you want to quickly switch back to your original voice.",
    gesture: "Swipe Down",
    color: "var(--pink)",
    icon: "STOP",
  },
];

export default function Effects() {
  const [selectedEffect, setSelectedEffect] = useState<EffectType>("normal");
  const [activeEffect, setActiveEffect] = useState<EffectType | null>(null);

  const handleEffectActivate = (effectType: EffectType) => {
    setActiveEffect(effectType);
    setSelectedEffect(effectType);
  };

  const handleEffectDeactivate = () => {
    setActiveEffect(null);
    setSelectedEffect("normal");
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
            maxWidth: 1400,
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
            <Link href="/effects" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--peach)", color: "var(--black)" }}>
              Effects
            </Link>
            <Link href="/studio" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--white)", color: "var(--black)" }}>
              Studio
            </Link>
            <Link href="/about" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--white)", color: "var(--black)" }}>
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main
        style={{
          maxWidth: 1400,
          margin: "2.5rem auto 0 auto",
          padding: "0 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* Hero Section */}
        <section
          style={{
            background: "var(--peach)",
            border: "4px solid var(--black)",
            borderRadius: "2.5rem",
            marginBottom: "2rem",
            padding: "3rem 2.5rem",
            textAlign: "center",
          }}
        >
          <h1 className="main-hero-headline" style={{ marginBottom: "1rem", textAlign: "center" }}>
            Voice Effects
          </h1>
          <div className="main-hero-sub" style={{ marginBottom: "2rem", textAlign: "center" }}>
            Explore and control different vocal effects with gestures or buttons
          </div>
          <Link href="/studio" className="main-btn">
            Try in Studio
          </Link>
        </section>

        {/* Active Effect Status */}
        {activeEffect && (
          <section
            style={{
              background: "var(--yellow)",
              border: "3px solid var(--black)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Currently Active: {EFFECTS.find(e => e.type === activeEffect)?.name}
            </h3>
            <p style={{ color: "#333", marginBottom: "1rem" }}>
              {EFFECTS.find(e => e.type === activeEffect)?.description}
            </p>
            <button
              className="main-btn"
              onClick={handleEffectDeactivate}
              style={{ background: "#dc2626", color: "white", marginRight: "1rem" }}
            >
              Stop Effect
            </button>
            <Link href="/studio" className="main-btn" style={{ background: "var(--black)", color: "white" }}>
              Use in Studio
            </Link>
          </section>
        )}

        {/* Effects Grid */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {EFFECTS.map((effect) => {
            const isSelected = selectedEffect === effect.type;
            const isActive = activeEffect === effect.type;
            
            return (
              <div
                key={effect.type}
                style={{
                  background: isActive ? effect.color : isSelected ? "var(--white)" : "var(--white)",
                  border: isActive ? "4px solid var(--black)" : "3px solid var(--black)",
                  borderRadius: "2rem",
                  padding: "2.5rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  boxShadow: isActive ? "0 8px 32px rgba(24,24,24,0.2)" : isSelected ? "0 4px 16px rgba(24,24,24,0.1)" : "none",
                  position: "relative",
                  height: "320px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                onClick={() => setSelectedEffect(effect.type)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 6px 24px rgba(24,24,24,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = isSelected ? "scale(1)" : "scale(1)";
                    e.currentTarget.style.boxShadow = isSelected ? "0 4px 16px rgba(24,24,24,0.1)" : "none";
                  }
                }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "#22c55e",
                    color: "white",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}>
                    ✓
                  </div>
                )}
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <span style={{ 
                      fontSize: "1.3rem", 
                      fontWeight: "bold",
                      background: "var(--black)",
                      color: "var(--white)",
                      padding: "0.6rem 1rem",
                      borderRadius: "0.6rem",
                      minWidth: "3.5rem",
                      textAlign: "center"
                    }}>{effect.icon}</span>
                    <h3 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>{effect.name}</h3>
                  </div>
                  <div style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: 600,
                    color: isActive ? "var(--black)" : "#666",
                    padding: "0.4rem 0.8rem",
                    background: isActive ? "rgba(0,0,0,0.1)" : "#f0f0f0",
                    borderRadius: "0.5rem"
                  }}>
                    {effect.gesture}
                  </div>
                </div>
                
                <p style={{ 
                  color: "#333", 
                  marginBottom: "2rem", 
                  fontSize: "1.1rem", 
                  lineHeight: "1.6",
                  flex: 1
                }}>
                  {effect.description}
                </p>
                
                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <div style={{ 
                    background: isActive ? "var(--black)" : isSelected ? "#f0f0f0" : "#f0f0f0", 
                    color: isActive ? "var(--white)" : "#333",
                    padding: "0.8rem 1.2rem",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                    textAlign: "center",
                    flex: 1
                  }}>
                    {isActive ? "Active" : isSelected ? "Selected" : "Click for Details"}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Selected Effect Details */}
        {selectedEffect && (
          <section
            style={{
              background: "var(--yellow)",
              border: "3px solid var(--black)",
              borderRadius: "1.5rem",
              padding: "2rem",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "1rem" }}>
              {EFFECTS.find(e => e.type === selectedEffect)?.name} - Details
            </h3>
            <p style={{ fontSize: "1.1rem", color: "#333", marginBottom: "1.5rem", lineHeight: "1.6" }}>
              {EFFECTS.find(e => e.type === selectedEffect)?.longDescription}
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ 
                background: "var(--white)", 
                padding: "0.8rem 1.2rem", 
                borderRadius: "1rem", 
                border: "2px solid var(--black)",
                fontWeight: 600
              }}>
                Gesture: {EFFECTS.find(e => e.type === selectedEffect)?.gesture}
              </div>
              <Link href="/studio" className="main-btn" style={{ padding: "0.8rem 1.2rem" }}>
                Try in Studio
              </Link>
            </div>
          </section>
        )}

        {/* Gesture Guide */}
        <section
          style={{
            background: "var(--pink)",
            border: "3px solid var(--black)",
            borderRadius: "1.5rem",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Gesture Controls</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 700, color: "var(--black)" }}>Open Hand</span>
              <span>= Normal</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 700, color: "var(--black)" }}>Fist</span>
              <span>= Reverb</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 700, color: "var(--black)" }}>Three Fingers</span>
              <span>= Chorus</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 700, color: "var(--black)" }}>Two Fingers</span>
              <span>= Layering</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 700, color: "var(--black)" }}>Swipe Down</span>
              <span>= Stop All FX</span>
            </div>
          </div>
        </section>


      </main>
    </>
  );
} 