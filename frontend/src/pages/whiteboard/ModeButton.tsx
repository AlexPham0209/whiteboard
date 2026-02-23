import ToggleButton from "@mui/material/ToggleButton";
import type { DrawMode } from "./line";

export function ModeButton({mode, selected, src}: {mode: DrawMode, selected: DrawMode, src: string}) {
    return (
        <ToggleButton
            value={mode}
            aria-label={mode}
            sx={{
              "&.Mui-selected, &.Mui-selected:hover": {
                color: "white",
                backgroundColor: "white", // Your custom color
              },
            }}
          >
            <img
              className={selected === mode ? "w-10 h-10" : "w-10 h-10 invert"}
              src={src}
            />
        </ToggleButton>
    );
}