interface Props {
  params: {
    serverId: string;
    channelSlug: string[];
  };
}

export default function ChannelPage({ params }: Props) {
  return (
    <>
      <div>serverId: {params.serverId}</div>
      <div>channelSlug: {JSON.stringify(params.channelSlug)}</div>
    </>
  );
}
