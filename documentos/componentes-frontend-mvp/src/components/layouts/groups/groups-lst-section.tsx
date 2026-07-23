"use client";

import { ResultMetadata } from "@/components/shared/metadata-result";
// import { SubgroupsListSectionSkeleton } from "@/components/subgroups/subgroups-list-section-skeleton";
import { useGroups } from "@/hooks/groups/use-groups";
import { GridGroups } from "./grid-groups";
import { SearchBarGroups } from "./search-bar-groups";
import { DrawerGroupForm } from "./drawer-group-form";
// import { SearchBarContainer } from "@/components/ui/search-bar-container";

export function GroupsListSection() {
  const { groups, isLoading, submitForm, groupSelected } = useGroups();
  return (
    <>
      <div>
        <SearchBarGroups onSubmit={submitForm} />
      </div>
      <section className="px-6" aria-labelledby="resultados-subgrupos">
        <ResultMetadata
          resourceName="Grupos"
          displayed={groups?.items.length ?? 0}
          total={(groups as any)?.total ?? 0}
          isLoading={false}
        />
        <h2 id="resultados-subgrupos" className="sr-only">
          Resultado da pesquisa de grupos
        </h2>
        {!isLoading ? (
          <GridGroups groups={groups?.items} />
        )
          : (
            <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
          )}

        <DrawerGroupForm
          initialData={groupSelected ?? undefined}
          mode={groupSelected ? "edit" : "create"}
        />
      </section>
    </>
  )
}