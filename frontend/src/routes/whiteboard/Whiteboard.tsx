import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { socket } from "../../socket.ts";
import {
  WhiteboardLine,
  type Color,
  type DrawMode,
  type Line,
} from "./line.tsx";
import { Palette } from "./Palette.tsx";
import { RoomCode } from "./RoomCode.tsx";
import { MemberList, type Member } from "./Member.tsx";
import { useRoom } from "../../contexts/RoomContext.tsx";

const CANVAS_SIZE = { width: 5000, height: 2500 };
const SCALE_BY = 1.1;

function Whiteboard() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { lines, setLines, members, setMembers, roomCode, leaveRoom } =
    useRoom();

  const stageWidth = size.width;
  const stageHeight = size.height;

  //Brush settings
  const [mode, setMode] = useState<DrawMode>("draw");
  const [color, setColor] = useState<Color>("black");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [currentLine, setCurrentLine] = useState<Line>();

  // Object references
  const isDrawing = useRef<boolean>(false);
  const stageRef = useRef<Konva.Stage>(null);

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Setting stage properties
    Konva.dragButtons = [2];

    // Apply CSS background to stage container
    if (stageRef.current) {
      const container = stageRef.current.container();
      container.style.backgroundColor = "gray";
    }
  }, []);

  // Socket.io events
  useEffect(() => {
    const onUpdate = (line: Line) => setLines((prev) => [...prev, line]);
    const onUpdateCanvas = (data: Line[]) => setLines(data);
    const onUpdateMembers = (members: Member[]) => setMembers(members);

    socket.on("update", onUpdate);
    socket.on("update_canvas", onUpdateCanvas);
    socket.on("update_members", onUpdateMembers);

    return () => {
      socket.off("update", onUpdate);
      socket.off("update_canvas", onUpdateCanvas);
      socket.off("update_members", onUpdateMembers);
    };
  }, [setLines, setMembers]);

  // Navigation and drawing functions
  const handleMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    if (e.evt instanceof MouseEvent && e.evt.button === 2) return;

    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage?.getRelativePointerPosition();

    if (pos) {
      setCurrentLine({
        draw_mode: mode,
        color: color,
        brush_size: brushSize,
        points: [pos!.x, pos!.y],
      });
    }
  };

  const handleMouseMove = async (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const pos = stage?.getRelativePointerPosition();

    if (pos) {
      setCurrentLine((prev: Line | undefined) => {
        if (!prev) return undefined;
        return {
          ...prev,
          points: [...prev.points, pos.x, pos.y],
        };
      });
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    if (currentLine === undefined) return;

    socket.emit("add_line", currentLine);
    setLines((prev) => [...prev, currentLine]);
    setCurrentLine(undefined);
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };


    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;
      
    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="absolute w-full top-0 z-10 p-5 flex flex-row items-start justify-between">
        <button className="exit-button" onClick={leaveRoom}>
          Leave Room
        </button>

        <RoomCode roomCode={roomCode ? roomCode : ""} />
        
        <MemberList members={members} />
      </div>
      

      <Palette
        mode={mode}
        setMode={setMode}
        color={color}
        setColor={setColor}
        setBrushSize={setBrushSize}
      />

      

      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        draggable
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer
          width={CANVAS_SIZE.width}
          height={CANVAS_SIZE.height}
          clipWidth={CANVAS_SIZE.width}
          clipHeight={CANVAS_SIZE.height}
        >
          <Rect
            width={CANVAS_SIZE.width}
            height={CANVAS_SIZE.height}
            fill={"white"}
          ></Rect>
          {lines.map((line, i) => (
            <WhiteboardLine key={i} line={line} />
          ))}
          {currentLine && <WhiteboardLine line={currentLine} />}
        </Layer>
      </Stage>
    </div>
  );
}

export default Whiteboard;
