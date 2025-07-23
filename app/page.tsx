"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Simple Welcome Page */}
      <main
        style={{
          maxWidth: 1100,
          margin: "4rem auto 0 auto",
          padding: "0 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
        }}
      >
        {/* Welcome Section */}
        <section
          style={{
            background: "var(--peach)",
            border: "4px solid var(--black)",
            borderRadius: "2.5rem",
            padding: "4rem 3rem",
            textAlign: "center",
            maxWidth: 600,
            width: "100%",
          }}
        >
          <h1 className="main-hero-headline" style={{ marginBottom: "1rem", textAlign: "center" }}>
            Welcome!
          </h1>
          <h2 className="main-hero-headline" style={{ marginBottom: "2rem", textAlign: "center", fontSize: "2rem" }}>
            Headphones Recommended
          </h2>
          <div className="main-hero-sub" style={{ marginBottom: "3rem", textAlign: "center", fontSize: "1.2rem", lineHeight: "1.6" }}>
            For the best experience, please use headphones.<br />
            This prevents audio feedback and lets you hear your voice effects clearly!
          </div>
          <Link href="/effects" className="main-btn">
            Continue to Sing & Wave
          </Link>
        </section>
      </main>
    </>
  );
} 