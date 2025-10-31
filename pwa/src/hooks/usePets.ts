// src/hooks/usePets.ts
import { useState, useEffect } from "react";
import { Pet } from "../types/emergency.types";
import { fetchPets } from "../services/apiService";

export function usePets(token: string | null) {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    if (token) {
      fetchPets(token)
        .then((formattedPets) => {
          console.log("Pets recebidos:", formattedPets);
          setPets(formattedPets);
        })
        .catch((err) => {
          console.error("Erro ao buscar pets:", err);
          // Você pode querer setar um estado de erro aqui
        });
    } else {
      console.log("Nenhum token encontrado, não buscará pets.");
    }
  }, [token]); // Depende do token

  // Expomos 'setPets' para que o 'handleSubmit' possa adicionar um pet novo
  return { pets, setPets };
}