import { SVGProps } from "react";

const COLOR_ONLINE = "hsl(135, 70%, 41%)";
const VIEW_BOX_SIZE = 64;
export default function OnlineIcon({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`} {...props}>
      <circle
        cx={VIEW_BOX_SIZE / 2}
        cy={VIEW_BOX_SIZE / 2}
        r={VIEW_BOX_SIZE / 2}
        fill={COLOR_ONLINE}
      />
    </svg>
  );
}
