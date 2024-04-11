<script setup lang="ts">
</script>

<template>
  <VRow>
    <!-- SECTION Customer Details -->
    <VCol cols="12">
      <VCard>
        <VCardText class="text-center pt-12">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded
            :size="120"
            color="white"
            variant="tonal"
          >
            <VImg />
            class="text-5xl font-weight-medium"
            >
            <!-- {{ avatarText(props.customerData.customer) }} -->
          </VAvatar>

          <!-- 👉 Customer fullName -->
          <h5 class="text-h5 mt-4">
            "Nombre"
          </h5>
          <div class="text-body-1">
            Customer ID #00000
          </div>

          <div class="d-flex justify-space-evenly gap-x-5 mt-6">
            <div class="d-flex align-center">
              <VAvatar
                variant="tonal"
                color="primary"
                rounded
                class="me-4"
              >
                <VIcon icon="tabler-shopping-cart" />
              </VAvatar>
              <div class="d-flex flex-column align-start">
                <h5 class="text-h5">
                  shalalala
                </h5>
                <div class="text-body-1">
                  Order
                </div>
              </div>
            </div>
            <div class="d-flex align-center">
              <VAvatar
                variant="tonal"
                color="primary"
                rounded
                class="me-3"
              >
                <VIcon icon="tabler-currency-dollar" />
              </VAvatar>
              <div class="d-flex flex-column align-start">
                <h5 class="text-h5">
                  aaaaaaa
                </h5>
                <div class="text-body-1">
                  Spent
                </div>
              </div>
            </div>
          </div>
        </VCardText>

        <!-- 👉 Customer Details -->
        <VCardText>
          <h5 class="text-h5">
            Details
          </h5>

          <VDivider class="my-4" />

          <VList class="card-list mt-2">
            <VListItem>
              <h6 class="text-h6">
                Username:
                <span class="text-body-1 d-inline-block">
                  ssssssssss
                </span>
              </h6>
            </VListItem>

            <VListItem>
              <h6 class="text-h6">
                Billing Email:
                <span class="text-body-1 d-inline-block">
                  ddddddddd
                </span>
              </h6>
            </VListItem>

            <VListItem>
              <div class="d-flex gap-x-2 align-center">
                <h6 class="text-h6">
                  Status:
                </h6>
                <VChip
                  label
                  color="success"
                  size="small"
                >
                  ffffffffff
                </VChip>
              </div>
            </VListItem>

            <VListItem>
              <h6 class="text-h6">
                Contact:
                <span class="text-body-1 d-inline-block">
                  asdasd
                </span>
              </h6>
            </VListItem>

            <VListItem>
              <h6 class="text-h6">
                Country:
                <span class="text-body-1 d-inline-block">
                  ggggggg
                </span>
              </h6>
            </VListItem>
          </VList>
        </VCardText>

        <VCardText class="text-center">
          <VBtn block>
            Edit Details
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->

    <!-- SECTION  Upgrade to Premium -->
    <VCol cols="12">
      <VCard
        flat
        class="current-plan"
      >
        <VCardText>
          <div class="d-flex align-center">
            <div>
              <h5 class="text-h5 text-white mb-4">
                Upgrade to premium
              </h5>
              <p class="mb-6 text-wrap">
                Upgrade customer to premium membership to access pro features.
              </p>
            </div>
            <div>
              <VImg
                src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
                height="108"
                width="108"
              />
            </div>
          </div>
          <VBtn
            color="#fff"
            class="text-primary"
            block
          >
            Upgrade to Premium
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </VRow>
</template>
