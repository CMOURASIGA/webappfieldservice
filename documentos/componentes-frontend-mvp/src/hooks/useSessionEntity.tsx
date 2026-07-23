"use client";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

export interface HandleChangeEntityDto {
  entityId: string;
}

interface Entity {
  name: string;
  id?: string;
  cnpj?: string;
  sigla?: string;
  role?: string;
  logoTipo?: string;
  tipo?: string;
  uf?: string;
}

export function useSessionEntity() {
  const { data: session, update, status: statusSession } = useSession();

  const company = session?.company;

  const userLogged = {
    name: session?.name,
    email: session?.email,
    image: session?.image,
    status: session?.status,
  };

  const isAuthenticated = Boolean(session);

  const entityLogged = {
    ...company,
    name: company?.name || "",
  };
  const entities = [entityLogged];

  const userRole = entityLogged?.role;

  const entitiesOptions = entities?.map((row: Entity) => {
    return {
      label: row.name,
      value: row.id,
    };
  });

  const handleChangeEntity = async ({ entityId }: HandleChangeEntityDto) => {
    if (entityId === session?.idEntidadeSessao) {
      return Swal.fire({
        text: "A entidade selecionada já está conectada ao sistema",
        icon: "info",
        width: 500,
        showConfirmButton: false,
        timer: 1500,
      });
    }
    await update({ idEntidadeSessao: entityId });

    Swal.fire({
      text: "A entidade alterada com sucesso!",
      icon: "success",
      width: 500,
      showConfirmButton: false,
    });
    window.location.replace("/");
  };

  return {
    handleChangeEntity,
    entityLogged,
    userLogged,
    entitiesOptions,
    isAuthenticated,
    userRole,
    statusSession,
    session,
    isAdmin: userRole === "admin",
  };
}
