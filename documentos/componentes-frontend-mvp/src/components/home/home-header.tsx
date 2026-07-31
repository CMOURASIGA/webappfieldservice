"use client";

import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderTitleContent,
} from "@cnc-ti/layout-basic";

export function HeaderHome() {
  return (
    <PageHeader className="flex flex-col gap-y-6 lg:flex-row">
      <PageHeaderTitleContent>
        <PageHeaderTitle
          title="Gestão de Eventos"
        />
      </PageHeaderTitleContent>
    </PageHeader>
  );
}
