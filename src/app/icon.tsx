import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          borderRadius: "32px",
        }}
      >
        <span
          style={{
            fontSize: "110px",
            fontWeight: 700,
            color: "#D4AF37",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size }
  );
}
