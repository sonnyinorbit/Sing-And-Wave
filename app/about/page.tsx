"use client"

import React from "react";
import Link from "next/link";

export default function About() {
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
            <Link href="/studio" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--white)", color: "var(--black)" }}>
              Studio
            </Link>
            <Link href="/about" className="main-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--peach)", color: "var(--black)" }}>
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main
        style={{
          maxWidth: 1100,
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
            About Sing & Wave
          </h1>
          <div className="main-hero-sub" style={{ marginBottom: "2rem", textAlign: "center" }}>
            A student project exploring accessible music technology
          </div>
        </section>

        {/* Made with Love Section */}
        <section
          style={{
            background: "var(--peach)",
            border: "3px solid var(--black)",
            borderRadius: "1.5rem",
            padding: "2rem",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Made with Love for Everyone</h3>
          <p style={{ fontSize: "1.1rem", color: "#333", marginBottom: "1.5rem", lineHeight: "1.6" }}>
            Sing & Wave is designed to be accessible to everyone. Whether you use prosthetics, 
            have limited mobility, or just want hands-free vocal effects, our gesture controls 
            work with any hand shape and movement style.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "var(--white)", padding: "1rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Prosthetic Friendly</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>Works with any hand shape</div>
            </div>
            <div style={{ background: "var(--white)", padding: "1rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>One-Handed</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>Perfect for limited mobility</div>
            </div>
            <div style={{ background: "var(--white)", padding: "1rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Gesture Adaptive</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>Learns your movement style</div>
            </div>
          </div>
          <div style={{ fontSize: "1rem", color: "#555", fontStyle: "italic" }}>
            Music should be accessible to everyone. That's why we built this.
          </div>
        </section>

        {/* Student Project Section */}
        <section
          style={{
            background: "var(--yellow)",
            border: "3px solid var(--black)",
            borderRadius: "1.5rem",
            padding: "2rem",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Student Project</h3>
          <p style={{ fontSize: "1.1rem", color: "#333", marginBottom: "1.5rem", lineHeight: "1.6" }}>
            This is a student-made project exploring gesture-controlled audio effects. 
            Gesture detection may not always be perfect - try holding gestures steady for best results!
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "var(--white)", padding: "1rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Technology</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>Next.js, React, Web Audio API</div>
            </div>
            <div style={{ background: "var(--white)", padding: "1rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Gesture Detection</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>MediaPipe Hands API</div>
            </div>
            <div style={{ background: "var(--white)", padding: "1rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Audio Effects</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>Real-time processing</div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          style={{
            background: "var(--pink)",
            border: "3px solid var(--black)",
            borderRadius: "1.5rem",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>How It Works</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div style={{ background: "var(--white)", padding: "1.5rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>1. Camera Detection</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>Your webcam detects hand gestures in real-time</div>
            </div>
            <div style={{ background: "var(--white)", padding: "1.5rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>2. Gesture Recognition</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>AI identifies hand shapes and movements</div>
            </div>
            <div style={{ background: "var(--white)", padding: "1.5rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>3. Audio Processing</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>Web Audio API applies effects to your voice</div>
            </div>
            <div style={{ background: "var(--white)", padding: "1.5rem", borderRadius: "1rem", border: "2px solid var(--black)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>4. Real-time Output</div>
              <div style={{ color: "#333", fontSize: "0.9rem" }}>Hear your voice with effects instantly</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            background: "var(--peach)",
            border: "3px solid var(--black)",
            borderRadius: "1.5rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "1rem" }}>Ready to Try?</h3>
          <p style={{ color: "#333", marginBottom: "2rem", fontSize: "1.1rem" }}>
            Experience accessible music technology in action!
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/effects" className="main-btn" style={{ padding: "0.8rem 1.5rem", fontSize: "1rem" }}>
              Explore Effects
            </Link>
            <Link href="/studio" className="main-btn" style={{ padding: "0.8rem 1.5rem", fontSize: "1rem" }}>
              Open Studio
            </Link>
          </div>
        </section>
      </main>
    </>
  );
} 