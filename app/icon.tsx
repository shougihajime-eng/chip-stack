import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
        {/* Chip outer ring */}
        <div
          style={{
            width: 440,
            height: 440,
            borderRadius: "50%",
            background: "#d4ad5f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Mid ring */}
          <div
            style={{
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "#062815",
              border: "8px solid #6b5630",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Inner felt */}
            <div
              style={{
                width: 340,
                height: 340,
                borderRadius: "50%",
                background: "linear-gradient(180deg, #156a44 0%, #0c4d31 50%, #062815 100%)",
                border: "6px solid #d4ad5f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f0d088",
                fontFamily: "serif",
                fontSize: 230,
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
