import { SVGProps, useId } from "react";

const SHADOW_RADIUS = 27;
const SHADOW_OFFSET_X = -16;
const SHADOW_OFFSET_Y = -16;
const COLOR_IDLE = "hsl(50, 100%, 65%)";
const VIEW_BOX_SIZE = 64;
export default function IdleIcon({ ...props }: SVGProps<SVGSVGElement>) {
  const maskId = useId();

  return (
    <svg viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`} {...props}>
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          <circle
            cx={VIEW_BOX_SIZE / 2 + SHADOW_OFFSET_X}
            cy={VIEW_BOX_SIZE / 2 + SHADOW_OFFSET_Y}
            r={SHADOW_RADIUS}
            fill="black"
          />
        </mask>
      </defs>
      <circle
        cx={VIEW_BOX_SIZE / 2}
        cy={VIEW_BOX_SIZE / 2}
        r={VIEW_BOX_SIZE / 2}
        fill={COLOR_IDLE}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
