import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text, Transformer, Rect } from "react-konva";

export type DrawMode = "draw" | "erase";
export type Color = "red" | "blue" | "black";

export interface Line {
  mode: DrawMode;
  color: Color;
  size: number;
  points: number[];
}

export interface Point {
  x: number;
  y: number;
}

function Whiteboard() {
  const state = {
    canvasWidth: 1500,
    canvasHeight: 1000,
    image: ""
  };

  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const checkSize = () => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
    };

    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // do your calculations for stage properties
  const stageWidth = size.width;
  const stageHeight = size.height;

  const [mode, setMode] = useState<DrawMode>("draw");
  const [color, setColor] = useState<Color>("black");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [lines, setLines] = useState<Line[]>([]);
  const [pointer, setPointer] = useState<Point>();

  const isDrawing = useRef<boolean>(false);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    Konva.dragButtons = [2];
    if (stageRef.current) {
      // Apply CSS background to stage container
      const container = stageRef.current.container();
      container.style.backgroundColor = "gray";
    }
  }, []);

  const handleMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent>,
  ) => {
    if (e.evt.button === 2) 
      return;
    
    isDrawing.current = true;
    const pos = e.target.getLayer()?.getRelativePointerPosition();

    const line: Line = {
      mode: mode,
      color: color,
      size: brushSize,
      points: [pos!.x, pos!.y],
    };
    setLines([...lines, line]);
  };

  const handleMouseMove = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    if (!isDrawing.current) return;
    
    const pos = e.target.getLayer()?.getRelativePointerPosition();

    const lastLine = lines[lines.length - 1];
    const next = lines.slice(0, -1);

    const newLine: Line = {
      ...lastLine,
      points: [...lastLine.points, pos!.x, pos!.y],
    };

    setLines([...next, newLine]);
  };

  const handleMouseUp = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    isDrawing.current = false;
  };

  return (
    <div className="w-full h-full flex ju">
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        
        onContextMenu={(e: Konva.KonvaEventObject<PointerEvent>) => {e.evt.preventDefault()}}
        draggable
      >
        <Layer 
          width={state.canvasWidth}
          height={state.canvasHeight}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onMouseLeave={() => {isDrawing.current = false;}}
        >
          <Rect
            width={state.canvasWidth}
            height={state.canvasHeight}
            fill={'white'}
          >
          </Rect>
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
                  line.mode === "erase" ? "destination-out" : "source-over"
                }
              />
            ))}

        </Layer>
      </Stage>

    </div>
  );
}

export default Whiteboard;
