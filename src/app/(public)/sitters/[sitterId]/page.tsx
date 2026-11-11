import SitterDetailPage from "@/features/sitters/components/SitterDetail/SitterDetailPage";

type PageProps = {
  params: Promise<{ sitterId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sitterId } = await params;

  return <SitterDetailPage sitterId={sitterId} />;
}
