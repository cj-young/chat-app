import { SVGProps, useId } from "react";

const COLOR_OFFLINE = "hsl(140, 3%, 50%)";
const VIEW_BOX_SIZE = 64;
const HOLE_RADIUS = 17;
export default function OfflineIcon({ ...props }: SVGProps<SVGSVGElement>) {
  const maskId = useId();

  return (
    <svg viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`} {...props}>
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          <circle
            cx={VIEW_BOX_SIZE / 2}
            cy={VIEW_BOX_SIZE / 2}
            r={HOLE_RADIUS}
            fill="black"
          />
        </mask>
      </defs>
      <circle
        cx={VIEW_BOX_SIZE / 2}
        cy={VIEW_BOX_SIZE / 2}
        r={VIEW_BOX_SIZE / 2}
        fill={COLOR_OFFLINE}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
