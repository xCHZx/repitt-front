<script setup>
const mockData = {
  status: 'success',
  data: [
    [
      {
        id: 1,
        name: 'Tarjetita del bisne',
        description: 'Tarjeta de recompensas del doctor chapatin',
        required_stamps: 6,
        start_date: '2024-06-04',
        end_date: '2024-05-04',
        stamp_icon_path: null,
        primary_color: null,
        business_id: 1,
        reward: 'Café pequeño gratis',
        is_completed: 0,
        created_at: '2024-04-07T04:09:02.000000Z',
        updated_at: '2024-04-07T04:09:02.000000Z',
        deleted_at: null,
        visits_count: 1,
        business: {
          id: 1,
          name: 'Doctor Chapatin 1',
          segment: 'Alimentos y bebidas',
        },
      },
      {
        id: 2,
        name: 'Tarjetita del bisne 14',
        description: 'Tarjeta de recompensas del doctor chapatin',
        required_stamps: 6,
        start_date: '2024-06-04',
        end_date: '2024-05-04',
        stamp_icon_path: null,
        primary_color: null,
        business_id: 14,
        reward: 'Papas fritas medianas gratis',
        is_completed: 0,
        created_at: '2024-04-10T00:21:52.000000Z',
        updated_at: '2024-04-10T00:21:52.000000Z',
        deleted_at: null,
        visits_count: 1,
        business: {
          id: 14,
          name: 'Doctor Chapatin 2',
          segment: 'Alimentos y bebidas',
        },
      },
      {
        id: 3,
        name: 'Tarjetita del bisne 15',
        description: 'Tarjeta de recompensas del doctor chapatin',
        required_stamps: 6,
        start_date: '2024-06-04',
        end_date: '2024-05-04',
        stamp_icon_path: null,
        primary_color: null,
        business_id: 15,
        reward: 'Hamburguesa de pollo sencilla gratis',
        is_completed: 0,
        created_at: '2024-04-10T16:09:30.000000Z',
        updated_at: '2024-04-10T16:09:30.000000Z',
        deleted_at: null,
        visits_count: 1,
        business: {
          id: 15,
          name: 'Doctor Chapatin 3',
          segment: 'Alimentos y bebidas',
        },
      },
    ],
  ],
}

const goToCard = id => {
  console.log('goToCard', id)
}
</script>

<template>
  <div>
    <div>
      <div
        v-for="card in mockData.data[0]"
        :key="card.id"
        class="mb-6"
      >
        <!-- 👉 VCard Rewards -->
        <VCard
          height="100"
          @click="goToCard(card.id)"
        >
          <VRow no-gutters>
            <VCol cols="3">
              <div class="ma-auto pa-3">
                <VImg
                  height="80"
                  src="https://i.pinimg.com/originals/aa/92/89/aa9289de1ed2865bccd7c7457f246482.jpg"
                  class="vertical-align-middle"
                />
              </div>
            </VCol>
            <VCol cols="7">
              <VCardItem class="px-3 pt-3 pb-0">
                <VCardTitle class="font-weight-bold text-h5">
                  {{ card.business.name }}
                </VCardTitle>
              </VCardItem>
              <VCardText class="text-subtitle-2 px-3 pb-1">
                <span
                  class="font-weight-medium text-white rounded pa-1 text-xs"
                  style="background-color: #493599;"
                >{{ card.business.segment }}</span>
              </VCardText>

              <VCardTitle class="text-h6 px-3 pt-1">
                <span class="font-weight-medium ">{{ card.reward }}</span>
              </VCardTitle>
            </VCol>
            <VCol
              cols="2"
              style="background-color: #493599;"
            >
              <div class="d-flex flex-column align-center py-10 h-200 justify-center">
                <p class="mb-8">
                  <sup class="text-h4 font-weight-medium text-white">{{ card.visits_count }}/{{ card.required_stamps }}</sup>
                </p>
              </div>
            </VCol>
          </VRow>
        </VCard>
      </div>
    </div>
  </div>
</template>
