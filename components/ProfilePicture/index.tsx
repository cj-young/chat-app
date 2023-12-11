import { IProfile, TOnlineStatus } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
  status?: TOnlineStatus;
}

const STATUS_X = 54;
const STATUS_Y = 54;
const STATUS_OUTLINE_RADIUS = 16;
const STATUS_RADIUS = 10;

export default function ProfilePicture({ user, status }: Props) {
  return (
    <svg
      className={styles["profile-picture"]}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {status ? (
          <mask id="profile-picture-mask-status" fill="white">
            <circle cx="32" cy="32" r="32" fill="white" />

            <circle
              cx={STATUS_X}
              cy={STATUS_Y}
              r={STATUS_OUTLINE_RADIUS}
              fill="black"
            />
          </mask>
        ) : (
          <mask id="profile-picture-mask-no-status" fill="white">
            <circle cx="32" cy="32" r="32" fill="white" />
          </mask>
        )}
      </defs>
      <image
        href={user.imageUrl}
        x="0"
        y="0"
        width="64"
        height="64"
        mask={`url(#profile-picture-mask-${status ? "status" : "no-status"})`}
      />
      {status === "online" ? (
        <StatusOnline />
      ) : status === "offline" ? (
        <StatusOffline />
      ) : status === "doNotDisturb" ? (
        <StatusDoNotDisturb />
      ) : status === "idle" ? (
        <StatusIdle />
      ) : (
        <></>
      )}
    </svg>
  );
}

const COLOR_ONLINE = "hsl(135, 70%, 41%)";
function StatusOnline() {
  return (
    <circle cx={STATUS_X} cy={STATUS_Y} r={STATUS_RADIUS} fill={COLOR_ONLINE} />
  );
}

const HOLE_RADIUS = 5;
const COLOR_OFFLINE = "hsl(140, 3%, 50%)";
function StatusOffline() {
  return (
    <svg>
      <defs>
        <mask id="status-mask">
          <rect width="100%" height="100%" fill="white" />
          <circle cx={STATUS_X} cy={STATUS_Y} r={HOLE_RADIUS} fill="black" />
        </mask>
      </defs>
      <circle
        cx={STATUS_X}
        cy={STATUS_Y}
        r={STATUS_RADIUS}
        fill={COLOR_OFFLINE}
        mask="url(#status-mask)"
      />
    </svg>
  );
}

const COLOR_DO_NOT_DISTURB = "hsl(3, 67%, 50%)";
const SLOT_WIDTH = 12;
const SLOT_HEIGHT = 6;
const ROTATION_ANGLE = 135;
function StatusDoNotDisturb() {
  return (
    <svg>
      <defs>
        <mask id="status-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect
            width={SLOT_WIDTH}
            height={SLOT_HEIGHT}
            x={STATUS_X - 0.5 * SLOT_WIDTH}
            y={STATUS_Y - 0.5 * SLOT_HEIGHT}
            fill="black"
            rx={Math.min(SLOT_HEIGHT, SLOT_WIDTH) / 2}
            ry={Math.min(SLOT_HEIGHT, SLOT_WIDTH) / 2}
            transform={`rotate(${ROTATION_ANGLE} ${STATUS_X} ${STATUS_Y})`}
          />
        </mask>
      </defs>
      <circle
        cx={STATUS_X}
        cy={STATUS_Y}
        r={STATUS_RADIUS}
        fill={COLOR_DO_NOT_DISTURB}
        mask="url(#status-mask)"
      />
    </svg>
  );
}

const SHADOW_RADIUS = 8;
const SHADOW_OFFSET_X = -5;
const SHADOW_OFFSET_Y = -5;
const COLOR_IDLE = "hsl(50, 100%, 65%)";
function StatusIdle() {
  return (
    <svg>
      <defs>
        <mask id="status-mask">
          <rect width="100%" height="100%" fill="white" />
          <circle
            cx={STATUS_X + SHADOW_OFFSET_X}
            cy={STATUS_Y + SHADOW_OFFSET_Y}
            r={SHADOW_RADIUS}
            fill="black"
          />
        </mask>
      </defs>
      <circle
        cx={STATUS_X}
        cy={STATUS_Y}
        r={STATUS_RADIUS}
        fill={COLOR_IDLE}
        mask="url(#status-mask)"
      />
    </svg>
  );
}
