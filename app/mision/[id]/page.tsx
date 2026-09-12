import MissionRunner from "@/components/MissionRunner";

export default async function MissionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <MissionRunner missionId={params.id} />;
}
