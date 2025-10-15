import { ArrowLeft, User } from "lucide-react";

export default function Header() {
  return (
    <header className="flex w-[100%] justify-between items-center px-4 py-3 border-b bg-white">
      <div className="flex items-center gap-2">
        <ArrowLeft size={20} />
      </div>
        <h1 className="font-bold text-lg">🐾 oBomVet</h1>
      <User size={22} />
    </header>
  );
}
