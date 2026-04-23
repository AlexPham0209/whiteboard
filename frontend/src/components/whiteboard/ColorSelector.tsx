import type { Color } from "./line";

export function ColorSelector({
  color,
  selected,
  setColor,
}: {
  color: Color;
  selected: Color;
  setColor: React.Dispatch<React.SetStateAction<Color>>;
}) {
  if (color === selected)
    return (
      <button
        style={{ backgroundColor: color }}
        className="rounded-full w-10 h-10 border-white border-3"
      />
    );

  return (
    <button
      style={{ backgroundColor: color }}
      onClick={() => setColor(color)}
      className="rounded-full w-10 h-10 bg-black border-gray-300 border-2"
    />
  );
}
