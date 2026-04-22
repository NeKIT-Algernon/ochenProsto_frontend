<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import { useCartStore } from '@/stores/cart'
import LocationIcon from '@/assets/icons/location.svg'
import CarIcon from '@/assets/icons/car.svg'
import VKIcon from '@/assets/icons/VK.svg'
import CartIcon from '@/assets/icons/cart.svg'
import Logo from '@/assets/logo.svg'

const siteSettingsStore = useSiteSettingsStore()
const cartStore = useCartStore()
const { siteSettings, isLoading } = storeToRefs(siteSettingsStore)
const { totalItemsCount } = storeToRefs(cartStore)

const phoneHref = computed(() => {
  if (!siteSettings.value?.primary_phone) {
    return '#'
  }

  const normalizedPhone = siteSettings.value.primary_phone.replace(/[^\d+]/g, '')
  return `tel:${normalizedPhone}`
})
</script>

<template>
  <header id="main_header">
    <div class="delivery-info">
      <div class="info-line">
        <LocationIcon class="icon" /> Cт. Ленинградская
      </div>
      <span class="info-line" v-if="siteSettings">
        <CarIcon class="icon" />Доставка от {{ siteSettings.free_delivery_amount }}&#8381; - бесплатно
      </span>
    </div>

    <RouterLink to="/" aria-label="На главную">
      <Logo class="logo" />
    </RouterLink>

    <div class="header-actions">
      <div class="phone-time-info">
        <a v-if="siteSettings" :href="phoneHref" class="phone" aria-label="Телефон для связи">{{
          siteSettings.primary_phone
        }}</a>
        <time v-if="siteSettings" class="time-of-work">{{ siteSettings.start_of_work }} - {{ siteSettings.end_of_work
          }}</time>
      </div>
      <a v-if="siteSettings" :href="siteSettings.VK_link" target="_blank" rel="noopener noreferrer"
        aria-label="Сообщество ВКонтакте">
        <VKIcon class="clickable-icon" />
      </a>
      <div class="vertical-devider"></div>
      <RouterLink to="/cart" aria-label="Корзина" class="cart-link">
        <CartIcon class="clickable-icon" />
        <span v-if="totalItemsCount > 0" class="cart-badge">{{ totalItemsCount }}</span>
      </RouterLink>
    </div>
  </header>
  <header id="mobile_header">
    <div class="general-mobile">
      <div class="phone-time-info">
        <a v-if="siteSettings" :href="phoneHref" class="phone" aria-label="Телефон для связи">{{
          siteSettings.primary_phone
        }}</a>
        <time v-if="siteSettings" class="time-of-work">{{ siteSettings.start_of_work }} - {{ siteSettings.end_of_work
          }}</time>
      </div>


      <RouterLink to="/" aria-label="На главную" class="logo">
        <Logo />
      </RouterLink>

      <div class="header-actions">

        <a v-if="siteSettings" :href="siteSettings.VK_link" target="_blank" rel="noopener noreferrer"
          aria-label="Сообщество ВКонтакте">
          <VKIcon class="clickable-icon" />
        </a>
        <div class="vertical-devider"></div>
        <RouterLink to="/cart" aria-label="Корзина" class="cart-link">
          <CartIcon class="clickable-icon" />
          <span v-if="totalItemsCount > 0" class="cart-badge">{{ totalItemsCount }}</span>
        </RouterLink>
      </div>
    </div>
    <div class="additionals-mobile">
      <span class="info-line" v-if="siteSettings">
        <CarIcon class="icon" />Доставка от {{ siteSettings.free_delivery_amount }}&#8381; - бесплатно
      </span>
      <div class="info-line">
        <LocationIcon class="icon" /> Cт. Ленинградская
      </div>

    </div>
  </header>
</template>

<style scoped>
#main_header {
  display: flex;
  padding: 0 var(--section-padding);
}

#mobile_header {
  display: none;
}

header {
  position: relative;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-default);
  font-size: var(--font-size-primary);
}

.logo {
  width: 120px;
  height: 60px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  top: 50%;
}

.delivery-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: var(--normal-gap);
  align-items: center;
}

.clickable-icon {
  width: 32px;
  height: 32px;
}

.cart-link {
  position: relative;
  display: inline-flex;
}

.cart-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  background-color: var(--color-primary);
  color: var(--color-border-default);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}

.icon {
  width: 24px;
  height: 24px;
}

.phone-time-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.phone {
  font-size: var(--font-size-primary);
}

.time-of-work {
  font-size: var(--font-size-small);
}

.vertical-devider {
  width: 1px;
  height: 70px;
  background-color: var(--color-border-default);
}

@media (max-width: 768px) {
  #main_header {
    display: none;
  }

  #mobile_header {
    height: 100px;
    display: flex;
    flex-direction: column;
  }

  .logo {
    width: var(--logo-width);
    height: var(--logo-height);
  }

  .additionals-mobile {
    height: 30px;
    display: flex;
    background-color: var(--color-secondary);
    align-items: center;
    justify-content: space-evenly;
    gap: var(--normal-gap);
    width: 100%;
    font-size: var(--font-size-small);
  }

  .general-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    position: relative;
    padding: 0 var(--section-padding);
  }
}
</style>
