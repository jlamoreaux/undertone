import { CSSProperties, FC, useState } from "react";

type BaseTileProps = React.DOMAttributes<HTMLDivElement> & {
  label: string;
  style?: CSSProperties;
};

export enum BACKGROUND_COLOR {
  UNREAD = "var(--mantine-color-gray-6)",
  READ = "var(--mantine-color-gray-8)",
}

export enum RECORDING_BACKGROUND_COLOR {
  SELECTED = "var(--mantine-color-indigo-6)",
  DESELECTED = "var(--mantine-color-indigo-2)",
}

const TILE_SIZE = "48px";
const HOVER_SIZE = "52px";


export const BaseTile: FC<BaseTileProps> = ({ label, style, ...attributes }) => {
  const [isHover, setIsHover] = useState<boolean>(false);

  const handleMouseEnter = () => setIsHover(true); // change this to true after getting things figured out
  const handleMouseLeave = () => setIsHover(false);


  const baseTileStyle: CSSProperties = {
    width: isHover ? HOVER_SIZE : TILE_SIZE,
    height: isHover ? HOVER_SIZE : TILE_SIZE,
    cursor: "pointer",
    color: "#efefef",
    textAlign: "center",
    lineHeight: isHover ? HOVER_SIZE : TILE_SIZE,
    margin: isHover ? "-2px" : "auto",
    // transition: "all .2s", // not sure how to get this to work without everything "jumping"
  };
  return (
    <div style={{ ...baseTileStyle, ...style }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...attributes}>
        {label}
    </div>
  );
}

