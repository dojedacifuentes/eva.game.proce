import CampaignBossBattle from "@/components/CampaignBossBattle";

export default async function BossPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <CampaignBossBattle bossId={params.id} />;
}
