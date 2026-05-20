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
          background: "radial-gradient(circle at 50% 35%, #1a3a2e 0%, #0a0e0d 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: "50%",
            border: "8px solid rgba(201, 169, 97, 0.55)",
            background:
              "radial-gradient(circle at 50% 40%, rgba(201,169,97,0.18) 0%, rgba(15,61,46,0.4) 60%, rgba(10,14,13,0.6) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e4c987",
            fontSize: 220,
            fontWeight: 600,
            letterSpacing: -8,
            boxShadow: "inset 0 4px 20px rgba(228, 201, 135, 0.18)",
          }}
        >
          CL
        </div>
      </div>
    ),
    { ...size },
  );
}
