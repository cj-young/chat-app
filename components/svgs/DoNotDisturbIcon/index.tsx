import { SVGProps, useId } from "react";

const COLOR_DO_NOT_DISTURB = "hsl(3, 67%, 50%)";
const SLOT_WIDTH = 38;
const SLOT_HEIGHT = 19;
const ROTATION_ANGLE = 135;
const VIEW_BOX_SIZE = 64;
export default function DoNotDisturbIcon({
  ...props
}: SVGProps<SVGSVGElement>) {
  const maskId = useId();

  return (
    <svg viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`} {...props}>
      <defs>
        <mask id={maskId}>
          <circle
            cx={VIEW_BOX_SIZE / 2}
            cy={VIEW_BOX_SIZE / 2}
            r={VIEW_BOX_SIZE / 2}
            fill="white"
          />
          <rect
            width={SLOT_WIDTH}
            height={SLOT_HEIGHT}
            x={VIEW_BOX_SIZE / 2 - 0.5 * SLOT_WIDTH}
            y={VIEW_BOX_SIZE / 2 - 0.5 * SLOT_HEIGHT}
            fill="black"
            rx={Math.min(SLOT_HEIGHT, SLOT_WIDTH) / 2}
            ry={Math.min(SLOT_HEIGHT, SLOT_WIDTH) / 2}
            transform={`rotate(${ROTATION_ANGLE} ${VIEW_BOX_SIZE / 2} ${
              VIEW_BOX_SIZE / 2
            })`}
          />
        </mask>
      </defs>
      <circle
        cx={VIEW_BOX_SIZE / 2}
        cy={VIEW_BOX_SIZE / 2}
        r={VIEW_BOX_SIZE}
        fill={COLOR_DO_NOT_DISTURB}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
