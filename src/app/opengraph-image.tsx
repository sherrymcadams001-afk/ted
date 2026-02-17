import { ImageResponse } from "next/og";

export const alt = "Tedlyns — Indulge Yourself";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          position: "relative",
        }}
      >
        {/* Subtle radial gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 70%)",
          }}
        />
        {/* Brand */}
        <span
          style={{
            fontSize: "80px",
            fontWeight: 700,
            color: "#D4AF37",
            fontFamily: "Georgia, serif",
            letterSpacing: "4px",
          }}
        >
          Tedlyns
        </span>
        <span
          style={{
            fontSize: "20px",
            color: "rgba(255,255,240,0.4)",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            marginTop: "8px",
          }}
        >
          Indulge Yourself
        </span>
        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            width: "80px",
            height: "2px",
            backgroundColor: "rgba(212,175,55,0.3)",
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "12px",
            color: "rgba(255,255,240,0.2)",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          Abuja&apos;s Premier Culinary Logistics
        </span>
      </div>
    ),
    { ...size }
  );
}
