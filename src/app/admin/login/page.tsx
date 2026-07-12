import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Iniciar sesión | Admin Palmas Mall" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/admin");
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-mist-100 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-card">
          <Image
            src="/brand/palmas-mall.png"
            alt="Palmas Mall"
            width={150}
            height={94}
            className="mx-auto h-20 w-auto"
            priority
          />
          <h1 className="mt-6 text-center font-display text-xl font-bold text-palm-950">
            Panel de administración
          </h1>
          <p className="mt-1 text-center text-sm text-mist-600">
            Ingresa con tu cuenta del equipo
          </p>
          <LoginForm callbackUrl={callbackUrl || "/admin"} />
        </div>
        <p className="mt-6 text-center text-[13px] text-mist-500">
          Acceso restringido al equipo de Palmas Mall
        </p>
      </div>
    </div>
  );
}
