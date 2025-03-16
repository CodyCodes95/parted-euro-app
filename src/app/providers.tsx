import { UploadThingProvider } from "@/components/UploadThing";

export function Providers({ children }: { children: React.ReactNode }) {
  return <UploadThingProvider>{children}</UploadThingProvider>;
}
