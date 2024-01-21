export type TMediaType = "video" | "audio" | "image";

export type TMessageMedia = {
  type: TMediaType;
  mediaUrl: string;
};
