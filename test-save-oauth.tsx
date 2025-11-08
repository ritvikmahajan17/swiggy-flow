import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  Flame,
  Clock,
  Award,
} from "lucide-react";

const SpendingDashboard = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "24px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Main spending card */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "20px",
            padding: "32px 24px",
            marginBottom: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            color: "white",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
            October Spending
          </div>
          <div
            style={{ fontSize: "48px", fontWeight: "700", marginBottom: "4px" }}
          >
            ₹12,450
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              opacity: 0.95,
            }}
          >
            <Calendar size={16} />
            <span>34 orders • 21 days</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div>
              <div
                style={{ fontSize: "13px", opacity: 0.8, marginBottom: "4px" }}
              >
                Avg. Order Value
              </div>
              <div style={{ fontSize: "24px", fontWeight: "600" }}>₹366</div>
            </div>
            <div>
              <div
                style={{ fontSize: "13px", opacity: 0.8, marginBottom: "4px" }}
              >
                Daily Spend
              </div>
              <div style={{ fontSize: "24px", fontWeight: "600" }}>₹593</div>
            </div>
          </div>
        </div>

        {/* Order frequency card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            color: "#2a2a2a",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                margin: 0,
                color: "#2a2a2a",
              }}
            >
              Order Patterns
            </h3>
            <Clock size={20} color="#667eea" />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "16px 12px",
                background:
                  "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                borderRadius: "12px",
                border: "1px solid #667eea20",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📦</div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "4px",
                  color: "#667eea",
                }}
              >
                11.3
              </div>
              <div
                style={{ fontSize: "11px", opacity: 0.7, lineHeight: "1.3" }}
              >
                orders per week
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "16px 12px",
                background:
                  "linear-gradient(135deg, #ff6b9d15 0%, #c4456915 100%)",
                borderRadius: "12px",
                border: "1px solid #ff6b9d20",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "4px",
                  color: "#ff6b9d",
                }}
              >
                Fri
              </div>
              <div
                style={{ fontSize: "11px", opacity: 0.7, lineHeight: "1.3" }}
              >
                most active day
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "16px 12px",
                background:
                  "linear-gradient(135deg, #ffa50015 0%, #ff8c3a15 100%)",
                borderRadius: "12px",
                border: "1px solid #ffa50020",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🌙</div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "4px",
                  color: "#ff8c3a",
                }}
              >
                8-9PM
              </div>
              <div
                style={{ fontSize: "11px", opacity: 0.7, lineHeight: "1.3" }}
              >
                peak hour
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #8b3a62 100%)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
              Spending Split
            </h3>
            <ShoppingBag size={20} />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                <span>Food Delivery</span>
                <span style={{ fontWeight: "600" }}>₹9,213</span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "74%",
                    height: "100%",
                    background: "rgba(255,255,255,0.9)",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>
                74% • 25 orders
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                <span>Instamart</span>
                <span style={{ fontWeight: "600" }}>₹3,237</span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "26%",
                    height: "100%",
                    background: "rgba(255,255,255,0.9)",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>
                26% • 9 orders
              </div>
            </div>
          </div>
        </div>

        {/* Top spending insight */}
        <div
          style={{
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            color: "#2a2a2a",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
              Biggest Splurge
            </h3>
            <Award size={20} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{ fontSize: "13px", opacity: 0.7, marginBottom: "4px" }}
              >
                Single Order
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  marginBottom: "4px",
                }}
              >
                ₹842
              </div>
              <div style={{ fontSize: "13px", opacity: 0.7 }}>
                Oct 15 • Dinner with friends
              </div>
            </div>
            <div style={{ fontSize: "48px" }}>🏆</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingDashboard;
