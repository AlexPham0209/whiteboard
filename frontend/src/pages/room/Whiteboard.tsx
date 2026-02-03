import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text, Transformer, Rect } from "react-konva";
import socket from "../../socket";

export type DrawMode = "draw" | "erase";

function isMode(s: string): s is DrawMode {
  return s === "draw" || s === "erase";
}

export type Color = "red" | "blue" | "black";

function isColor(s: string): s is Color {
  return s === "red" || s === "blue" || s === "black";
}

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
    image: "",
  };

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  // do your calculations for stage properties
  const stageWidth = size.width;
  const stageHeight = size.height;

  const [mode, setMode] = useState<DrawMode>("draw");
  const [color, setColor] = useState<Color>("black");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line>();

  const isDrawing = useRef<boolean>(false);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  useEffect(() => {
    const checkSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    function onUpdate({
      mode,
      color,
      size,
      points,
    }: {
      mode: string;
      color: string;
      size: number;
      points: number[];
    }) {
      if (!isColor(color) && !isMode(mode)) return;

      const line: Line = {
        mode: mode as DrawMode,
        color: color as Color,
        size: size,
        points: points,
      };

      setLines([...lines, line]);
    }
    socket.on("update", onUpdate);

    return () => {
      socket.off("update", onUpdate);
    };
  }, [lines]);

  useEffect(() => {
    Konva.dragButtons = [2];
    if (stageRef.current) {
      // Apply CSS background to stage container
      const container = stageRef.current.container();
      container.style.backgroundColor = "gray";
    }
  }, []);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 2) return;

    isDrawing.current = true;
    const pos = e.target.getLayer()?.getRelativePointerPosition();

    const line: Line = {
      mode: mode,
      color: color,
      size: brushSize,
      points: [pos!.x, pos!.y],
    };
    setCurrentLine(line);
  };

  const handleMouseMove = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    if (!isDrawing.current) return;

    const pos = e.target.getLayer()?.getRelativePointerPosition();

    if (currentLine !== undefined) {
      const newLine: Line = {
        ...currentLine,
        points: [...currentLine.points, pos!.x, pos!.y],
      };

      setCurrentLine(newLine);
    }
  };

  const handleMouseUp = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    isDrawing.current = false;
    if (currentLine === undefined) return;

    const data = {
      mode: currentLine.mode as string,
      color: currentLine.color as string,
      size: currentLine.size,
      points: currentLine.points,
    };

    setCurrentLine(undefined);
    socket.emit("add_line", data);
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = stage?.scaleX();
    const pointer = stage?.getPointerPosition();

    const mousePointTo = {
      x: (pointer!.x - stage!.x()) / oldScale!,
      y: (pointer!.y - stage!.y()) / oldScale!,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? -1 : 1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const scaleBy = 1.05;
    const newScale = direction > 0 ? oldScale! * scaleBy : oldScale! / scaleBy;

    stage!.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer!.x - mousePointTo.x * newScale,
      y: pointer!.y - mousePointTo.y * newScale,
    };
    stage!.position(newPos);
  };

  return (
    <div className="w-full h-full flex justify-center">
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onContextMenu={(e: Konva.KonvaEventObject<PointerEvent>) => {
          e.evt.preventDefault();
        }}
        draggable
        onWheel={handleWheel}
        onMouseup={handleMouseUp}
      >
        <Layer
          width={state.canvasWidth}
          height={state.canvasHeight}
          ref={layerRef}
          clipWidth={state.canvasWidth}
          clipHeight={state.canvasHeight}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
        >
          <Rect
            width={state.canvasWidth}
            height={state.canvasHeight}
            fill={"white"}
          ></Rect>
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

          {currentLine && (
            <Line
              key={lines.length}
              points={currentLine.points}
              stroke={currentLine.color}
              strokeWidth={currentLine.size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                currentLine.mode === "erase" ? "destination-out" : "source-over"
              }
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default Whiteboard;
