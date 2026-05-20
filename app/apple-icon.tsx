import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 50% 35%, #0d4a2f 0%, #051a10 75%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 156,
            height: 156,
            borderRadius: "50%",
            background: "#d4ad5f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 142,
              height: 142,
              borderRadius: "50%",
              background: "#062815",
              border: "3px solid #6b5630",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 122,
                height: 122,
                borderRadius: "50%",
                background: "linear-gradient(180deg, #156a44 0%, #0c4d31 50%, #062815 100%)",
                border: "2px solid #d4ad5f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f0d088",
                fontFamily: "serif",
                fontSize: 80,
                fontWeight: 700,
              }}
            >
              ♠
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
