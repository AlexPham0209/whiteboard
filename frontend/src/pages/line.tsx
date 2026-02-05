import { Stage, Layer, Line, Text, Transformer, Rect } from "react-konva";

export type DrawMode = "draw" | "erase";
export type Color = "red" | "blue" | "black";

export interface Line {
  draw_mode: DrawMode;
  color: Color;
  brush_size: number;
  points: number[];
}

export const toLine = (data: {
  mode: string;
  color: string;
  points: number[];
  brush_size: number;
}) => {
  return {
    draw_mode: data.mode as DrawMode,
    color: data.color as Color,
    brush_size: data.brush_size,
    points: data.points,
  };
};

export const toKonvaLine = (line: Line, i: number) => {
  return (
    <Line
      key={i}
      points={line.points}
      stroke={line.color}
      strokeWidth={line.brush_size}
      tension={0.5}
      lineCap="round"
      lineJoin="round"
      globalCompositeOperation={
        line.draw_mode === "erase" ? "destination-out" : "source-over"
      }
    />
  );
};
