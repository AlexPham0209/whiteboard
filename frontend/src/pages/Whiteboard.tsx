import Konva from "konva";
import { useEffect, useRef, useState, type SetStateAction } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { socket } from "../socket";
import { toKonvaLine, type Color, type DrawMode, type Line } from "./line.tsx";
import { ColorSelector } from "./ColorSelector.tsx";
import Slider from "@mui/material/Slider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

const canvasWidth = 1500;
const canvasHeight = 1000;

function Whiteboard() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  // do your calculations for stage properties
  const stageWidth = size.width;
  const stageHeight = size.height;

  //Brush settings
  const [mode, setMode] = useState<DrawMode>("draw");
  const [color, setColor] = useState<Color>("black");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line>();
  const [roomCode, setRoomCode] = useState<string>("ABCDE");
  const [users, setUsers] = useState<{ username: string; joined_at: string }[]>(
    [],
  );

  // Object references
  const isDrawing = useRef<boolean>(false);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    // Canvas initialization
    // Retrieve all drawn lines by users from the backend
    socket.emit("get_canvas");
    socket.emit("get_code");
    socket.emit("get_users");

    // Setting stage properties
    Konva.dragButtons = [2];
    if (stageRef.current) {
      // Apply CSS background to stage container
      const container = stageRef.current.container();
      container.style.backgroundColor = "gray";
    }

    // Dynamic stage resizing
    const checkSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Socket.io events
  useEffect(() => {
    const onUpdate = (line: Line) => {
      setLines([...lines, line]);
    };

    const onUpdateCanvas = (data: Line[]) => {
      setLines(data);
    };

    const onUpdateCode = (code: string) => {
      setRoomCode(code);
    };

    const onUpdateUsers = (
      users: { username: string; joined_at: string }[],
    ) => {
      setUsers(users);
    };

    socket.on("update", onUpdate);
    socket.on("update_canvas", onUpdateCanvas);
    socket.on("update_code", onUpdateCode);
    socket.on("update_users", onUpdateUsers);

    return () => {
      socket.off("update_canvas", onUpdateCanvas);
      socket.off("update", onUpdate);
      socket.off("update_code", onUpdateCode);
      socket.off("update_users", onUpdateUsers);
    };
  }, [lines]);

  // Navigation and drawing functions
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 2) return;

    isDrawing.current = true;
    const pos = e.target.getLayer()?.getRelativePointerPosition();

    const line: Line = {
      draw_mode: mode,
      color: color,
      brush_size: brushSize,
      points: [pos!.x, pos!.y],
    };
    setCurrentLine(line);
  };

  const handleMouseMove = async (
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

  const handleMouseUp = () => {
    isDrawing.current = false;
    if (currentLine === undefined) return;

    socket.emit("add_line", currentLine);
    setLines([...lines, currentLine]);
    setCurrentLine(undefined);
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;

    if (stage === null) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (pointer === null) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
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

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
  };

  return (
    <div className="w-full h-full flex justify-center">
      <div className="absolute m-auto mt-10 z-10 text-3xl font-bold text-white drop-shadow-[0_2.2px_1.2px_rgba(0,0,0,0.8)]">
        {roomCode}
      </div>
      <div className="absolute flex flex-col z-11 justify-between items-center bottom-10 w-1/3 h-35 text-2xl rounded-4xl font-bold bg-gray-900 shadow-2xl p-5">
        <div className="flex flex-row justify-center items-center gap-10">
          <ToggleButtonGroup
            color="success"
            orientation="horizontal"
            value={mode}
            exclusive
            onChange={(
              event: React.MouseEvent<HTMLElement>,
              nextView: DrawMode,
            ) => {
              if (nextView !== null) setMode(nextView);
            }}
          >
            <ToggleButton
              value="draw"
              aria-label="draw"
              sx={{
                "&.Mui-selected, &.Mui-selected:hover": {
                  color: "white",
                  backgroundColor: "white", // Your custom color
                },
              }}
            >
              <img
                className={mode === "draw" ? "w-10 h-10" : "w-10 h-10 invert"}
                src="brush.png"
              />
            </ToggleButton>

            <ToggleButton
              value="erase"
              aria-label="erase"
              sx={{
                "&.Mui-selected, &.Mui-selected:hover": {
                  color: "white",
                  backgroundColor: "white", // Your custom color
                },
              }}
            >
              <img
                className={mode === "erase" ? "w-10 h-10" : "w-10 h-10 invert"}
                src="erase.png"
              />
            </ToggleButton>
          </ToggleButtonGroup>
          <ColorSelector color={"red"} selected={color} setColor={setColor} />
          <ColorSelector color={"black"} selected={color} setColor={setColor} />
          <ColorSelector color={"blue"} selected={color} setColor={setColor} />
        </div>

        <div className="left-1/2 w-1/2">
          <Slider
            aria-label="volume"
            defaultValue={5}
            sx={{
              color: "white",
            }}
            onChange={(event: Event, value: number) => setBrushSize(value)}
            valueLabelDisplay="auto"
            shiftStep={30}
            step={1}
            min={1}
            max={12}
          />
        </div>
      </div>
      <div className="absolute flex flex-col right-10 t-0 m-10 z-10 text-2xl font-bold text-black">
        {users.map((user) => {
          return (
            <div className="font-bold text-white drop-shadow-[0_2.2px_1.2px_rgba(0,0,0,0.8)]">
              {user.username}
            </div>
          );
        })}
      </div>

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
          width={canvasWidth}
          height={canvasHeight}
          clipWidth={canvasWidth}
          clipHeight={canvasHeight}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
        >
          <Rect width={canvasWidth} height={canvasHeight} fill={"white"}></Rect>
          {lines.map(toKonvaLine)}
          {currentLine && toKonvaLine(currentLine, lines.length - 1)}
        </Layer>
      </Stage>
    </div>
  );
}

export default Whiteboard;
