import { Line } from "react-konva";

export type DrawMode = "draw" | "erase";
export type Color = "red" | "blue" | "black";

export interface Line {
  draw_mode: DrawMode;
  color: Color;
  brush_size: number;
  points: number[];
}

export const toKonvaLine = (line: Line, i: number) => {
  return (
    <Line
      key={i}
      points={line.points}
      stroke={line.draw_mode === "erase" ? line.color : "white"}
      strokeWidth={line.brush_size}
      tension={0.5}
      lineCap="round"
      lineJoin="round"
      globalCompositeOperation={
        "source-over"
      }
    />
  );
};
