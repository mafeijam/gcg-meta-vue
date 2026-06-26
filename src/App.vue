<template>
  <div class="min-h-screen bg-white font-display dark:bg-nalika-bg dark:text-nalika-text-muted">
    <nav
      class="sticky top-0 z-999 flex w-full items-center border-b border-gray-500/10 bg-white px-4 py-2 dark:bg-nalika-surface"
    >
      <div class="flex-1" />
      <div class="flex gap-4">
        <RouterLink
          to="/"
          class="[&.router-link-exact-active]:font-bold [&.router-link-exact-active]:text-primary"
        >
          Archetype Tier
        </RouterLink>
        <RouterLink
          to="/archetype-analysis"
          class="[&.router-link-exact-active]:font-bold [&.router-link-exact-active]:text-primary"
        >
          Archetype Analysis
        </RouterLink>
      </div>
      <div class="flex flex-1 justify-end">
        <DarkToggle />
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<script setup></script>
