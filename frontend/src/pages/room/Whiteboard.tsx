import type Konva from "konva";
import { useRef, useState } from "react";
import { Stage, Layer, Line, Text } from 'react-konva';

export type DrawMode = "draw" | "erase";
export type Color = "red" | "blue" | "black";

export interface Line {
    mode: DrawMode,
    color: Color,
    size: number,
    points: number[],
}

export interface Point {
    x: number,
    y: number,
}


function Whiteboard() {
    const [mode, setMode] = useState<DrawMode>("draw");
    const [color, setColor] = useState<Color>("black");
    const [size, setSize] = useState<number>(5);
    const [lines, setLines] = useState<Line[]>([]);
    const [pointer, setPointer] = useState<Point>();
    const isDrawing = useRef(false);

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        isDrawing.current = true;
        const pos = e.target.getStage()?.getPointerPosition();
        
        const line: Line = {
            mode: mode,
            color: color,
            size: size,
            points: [pos!.x, pos!.y]
        } 
        setLines([...lines, line]);
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (!isDrawing.current)
            return;

        const pos = e.target.getStage()?.getPointerPosition();

        const lastLine = lines[lines.length - 1];
        const next = lines.slice(0, -1);

        const newLine: Line = {
            ...lastLine,
            points: [...lastLine.points, pos!.x, pos!.y]
        };

        setLines([...next, newLine]);
    };

    const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        isDrawing.current = false;
    };

    return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.mode === 'erase' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default Whiteboard;