import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ProfileForm } from "@/components/donateur/profile-form";

export default async function DonateurProfilPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;

  return <ProfileForm user={user} />;
}
