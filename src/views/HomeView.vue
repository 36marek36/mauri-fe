<template>

</template>

<script>
import { useHeaderStore } from '@/stores/header';

export default {
  created() {
    const header = useHeaderStore();
    header.setTitle('Handlovská', 'Tenisová Liga');
  },
}
</script>