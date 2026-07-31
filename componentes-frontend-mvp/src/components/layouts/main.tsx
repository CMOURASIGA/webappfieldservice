"use client";
import {
  Header,
  HeaderContainer,
  Sidebar,
  SidebarContainer,
  SidebarImageBrand,
  SidebarNavLink,
  HeaderProfileHeader,
  HeaderProfileItem,
} from "@cnc-ti/layout-basic";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

type Props = {
  children?: React.ReactNode;
};

export function Main({ children }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  // const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  function toggleSidebar() {
    setCollapsed((prev) => !prev);
  }

  return (
    <div className="flex w-full min-h-screen">
      {isAuthenticated && (
        <div
          data-open-sidebar={collapsed}
          className={`fixed left-0 top-0 z-40 cnc-bg-primary-800 transition-all duration-300 ${collapsed ? "w-screen md:w-[280px]" : "w-0 relative"
            }`}
        >
          <SidebarContainer isOpen={collapsed} onChange={toggleSidebar}>
            <SidebarImageBrand onChangeToggle={toggleSidebar} asChild>
              <Link href="/">
                <Image
                  className="mt-2.5"
                  src="/logo-eventos.svg"
                  alt="Gestão de Eventos"
                  width={190}
                  height={100}
                />
              </Link>
            </SidebarImageBrand>

            <Sidebar type="single">
              <SidebarNavLink href="/" asChild>
                <Link href="/">
                  <i className="fa-solid fa-chart-line"></i>Agenda
                </Link>
              </SidebarNavLink>
              <SidebarNavLink href="/eventos" asChild>
                <Link href="/eventos">
                  <i className="fa-solid fa-calendar-days"></i> Eventos
                </Link>
              </SidebarNavLink>
              <SidebarNavLink href="/espacos" asChild>
                <Link href="/espacos">
                  <i className="fa-solid fa-building"></i> Espaços
                </Link>
              </SidebarNavLink>
              {/* <SidebarNavLink href="#" asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsCadastrosOpen(!isCadastrosOpen);
                  }}
                  className="w-full bg-transparent border-0 cursor-pointer flex items-center"
                >
                  <i className="fa-solid fa-folder-plus"></i>
                  <span className="flex-1 text-left ml-2">Cadastros</span>
                  <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isCadastrosOpen ? 'rotate-180' : ''} ml-auto`}></i>
                </button>
              </SidebarNavLink>
              
              {isCadastrosOpen && (
                <div className="pl-4 mt-1 space-y-1">
                   {/* <SidebarNavLink href="/cadastros/locais" asChild>
                    <Link href="/cadastros/locais">
                      <i className="fa-solid fa-map-location-dot"></i> Locais
                    </Link>
                  </SidebarNavLink> * /}
                </div>
              )} */}
            </Sidebar>
          </SidebarContainer>
        </div>
      )}

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${isAuthenticated && collapsed ? "md:pl-[280px]" : "pl-0"
          }`}
      >
        {isAuthenticated && (
          <Header className="z-10">
            <HeaderContainer onOpenMenu={toggleSidebar} isOpen={collapsed}>
              {session && (
                <HeaderProfileHeader
                  user={{
                    entityName: "CNC",
                    userName: (session as any)?.name || session?.user?.name || "Usuário",
                  }}
                >
                  <HeaderProfileItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    icon={<i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>}
                  >
                    Sair
                  </HeaderProfileItem>
                </HeaderProfileHeader>
              )}
            </HeaderContainer>
          </Header>
        )}
        <main className="flex-1 p-0">{children}</main>
      </div>
    </div>
  );
}
