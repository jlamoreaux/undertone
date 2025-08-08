import { CSSProperties, FC, useState } from "react";

type BaseTileProps = React.DOMAttributes<HTMLDivElement> & {
  label: string;
  style?: CSSProperties;
};

export const BACKGROUND_COLOR = {
  UNREAD: "var(--mantine-color-gray-5)",
  READ: "var(--mantine-color-gray-7)",
};

export const RECORDING_BACKGROUND_COLOR = {
  SELECTED: "var(--mantine-color-indigo-6)",
  DESELECTED: "var(--mantine-color-indigo-2)",
};

const TILE_SIZE = "48px";

export const BaseTile: FC<BaseTileProps> = ({ label, style, ...attributes }) => {
  const [isHover, setIsHover] = useState<boolean>(false);

  const handleMouseEnter = () => setIsHover(true);
  const handleMouseLeave = () => setIsHover(false);

  const baseTileStyle: CSSProperties = {
    width: TILE_SIZE,
    height: TILE_SIZE,
    cursor: "pointer",
    color: "white",
    fontWeight: 600,
    textAlign: "center",
    lineHeight: TILE_SIZE,
    borderRadius: "4px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    transform: isHover ? "scale(1.08)" : "scale(1)",
    boxShadow: isHover ? "0 4px 12px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.1)",
  };
  return (
    <div style={{ ...baseTileStyle, ...style }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...attributes}>
        {label}
    </div>
  );
}

