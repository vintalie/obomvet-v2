import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";

export default function BackButton({ to }: { to?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 flex items-center gap-2"
      onClick={() => to ? navigate(to) : navigate(-1)}
    >
      <MdArrowBack size={18} />
      Voltar
    </button>
  );
}
