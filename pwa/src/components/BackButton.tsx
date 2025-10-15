import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";

export default function BackButton({ to }: { to?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="p-1 text-gray-700 hover:text-gray-900"
      onClick={() => to ? navigate(to) : navigate(-1)}
    >
      <MdArrowBack size={24} />
    </button>
  );
}
