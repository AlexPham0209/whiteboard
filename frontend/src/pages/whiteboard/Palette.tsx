import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { DrawMode, Color } from "./line";
import { ColorSelector } from "./ColorSelector";
import Slider from "@mui/material/Slider";
import { ModeButton } from "./ModeButton";

export function Palette({
  mode,
  setMode,
  color,
  setColor,
  setBrushSize,
}: {
  mode: DrawMode;
  setMode: React.Dispatch<React.SetStateAction<DrawMode>>;
  color: Color;
  setColor: React.Dispatch<React.SetStateAction<Color>>;
  setBrushSize: React.Dispatch<React.SetStateAction<number>>;
}) {

  const onModeChange = (_: React.MouseEvent<HTMLElement>, nextView: DrawMode) => {
    if (nextView !== null) setMode(nextView);
  };
  
  const onBrushSizeChange = (_: Event, value: number) => setBrushSize(value);

  return (
    <div className="absolute flex flex-col z-11 justify-between items-center bottom-10 w-1/3 h-35 text-2xl rounded-4xl font-bold bg-gray-900 shadow-2xl p-5">
      <div className="flex flex-row justify-center items-center gap-10">
        <ToggleButtonGroup
          color="success"
          orientation="horizontal"
          value={mode}
          exclusive
          onChange={onModeChange}
        >
          <ModeButton mode={"draw"} selected={mode} src={"brush.png"}/>
          <ModeButton mode={"erase"} selected={mode} src={"erase.png"}/>
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
          onChange={onBrushSizeChange}
          valueLabelDisplay="auto"
          shiftStep={30}
          step={1}
          min={1}
          max={12}
        />
      </div>
    </div>
  );
}
