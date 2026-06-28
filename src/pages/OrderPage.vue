<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { createOrder, createOrderItem } from '@/api'
import { useCartStore } from '@/stores/cart'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import HomePageButton from '@/components/HomePageButton.vue'

type PayOption = 'card' | 'cash'
type ApartmentField = 'entrance' | 'floor' | 'apartment'

const NAME_MAX_LENGTH = 40
const ADDRESS_MAX_LENGTH = 30
const COMMENT_MAX_LENGTH = 200
const ENTRANCE_MAX_VALUE = 98
const FLOOR_MAX_VALUE = 98
const APARTMENT_MAX_VALUE = 9998

const cartStore = useCartStore()
const siteSettingsStore = useSiteSettingsStore()
const { items } = storeToRefs(cartStore)
const { siteSettings } = storeToRefs(siteSettingsStore)

const form = reactive({
  street: '',
  house: '',
  isPrivateHouse: true,
  entrance: '',
  floor: '',
  apartment: '',
  clientName: '',
  clientPhone: '',
  payOption: 'card' as PayOption,
  comment: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const isSuccessModalOpen = ref(false)
const successMessage = ref('Ваш заказ успешно оформлен. Скоро вам позвонит менеджер для подтверждения.')

const isOrderingClosed = computed(() => {
  return siteSettings.value?.isClosed === true
})

const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => sum + item.total_price, 0)
})

const formattedTotalPrice = computed(() => {
  return new Intl.NumberFormat('ru-RU').format(totalPrice.value)
})

function parseAddressParts(street: string, house: string) {
  const normalizedStreet = street.trim()
  const normalizedHouse = house.trim()

  if (normalizedHouse) {
    return {
      street: normalizedStreet,
      house: normalizedHouse,
    }
  }

  // Поле адреса в форме одно, поэтому поддерживаем ввод вида "Ленина, 12".
  const commaSeparatedParts = normalizedStreet
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (commaSeparatedParts.length >= 2) {
    return {
      street: commaSeparatedParts.slice(0, -1).join(', '),
      house: commaSeparatedParts.at(-1) ?? '',
    }
  }

  const inlineHouseMatch = normalizedStreet.match(/^(.*\D)\s+(\d+[^\s,/]*)$/)

  if (inlineHouseMatch) {
    const [, parsedStreet = '', parsedHouse = ''] = inlineHouseMatch

    return {
      street: parsedStreet.trim(),
      house: parsedHouse.trim(),
    }
  }

  return {
    street: normalizedStreet,
    house: '',
  }
}

// Держим единый разбор адреса для валидации и payload заказа.
const normalizedAddress = computed(() => {
  return parseAddressParts(form.street, form.house)
})

const fullAddress = computed(() => {
  const parts = [`ул. ${normalizedAddress.value.street}`, `дом ${normalizedAddress.value.house}`]

  if (form.isPrivateHouse) {
    parts.push('частный дом')
  } else {
    if (form.entrance) {
      parts.push(`парадная ${form.entrance}`)
    }

    if (form.floor) {
      parts.push(`этаж ${form.floor}`)
    }

    if (form.apartment) {
      parts.push(`квартира ${form.apartment}`)
    }
  }

  return parts.join(', ')
})

function getCurrentTime() {
  return new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function clearApartmentFields() {
  form.entrance = ''
  form.floor = ''
  form.apartment = ''
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}

function applyPhoneMask(value: string) {
  const digits = normalizeDigits(value).slice(0, 11)

  if (digits.length === 0) {
    return ''
  }

  let normalized = digits

  if (normalized[0] === '8') {
    normalized = `7${normalized.slice(1)}`
  }

  if (normalized[0] !== '7') {
    normalized = `7${normalized.slice(0, 10)}`
  }

  const part1 = normalized.slice(1, 4)
  const part2 = normalized.slice(4, 7)
  const part3 = normalized.slice(7, 9)
  const part4 = normalized.slice(9, 11)

  let result = '+7'

  if (part1) {
    result += ` (${part1}`
  }

  if (part1.length === 3) {
    result += ')'
  }

  if (part2) {
    result += ` ${part2}`
  }

  if (part3) {
    result += `-${part3}`
  }

  if (part4) {
    result += `-${part4}`
  }

  return result
}

function onPhoneInput(event: Event) {
  const target = event.target as HTMLInputElement
  form.clientPhone = applyPhoneMask(target.value)
}

function onPhoneFocus() {
  if (!form.clientPhone) {
    form.clientPhone = '+7 ('
  }
}

function onPhoneBlur() {
  if (normalizeDigits(form.clientPhone).length <= 1) {
    form.clientPhone = ''
  }
}

function onPhoneKeydown(event: KeyboardEvent) {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Home',
    'End',
  ]

  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

// Числовые поля квартиры нормализуем сразу на вводе, чтобы туда не попадал мусор.
function onApartmentFieldInput(field: ApartmentField, event: Event) {
  const target = event.target as HTMLInputElement
  const limits: Record<ApartmentField, number> = {
    entrance: ENTRANCE_MAX_VALUE,
    floor: FLOOR_MAX_VALUE,
    apartment: APARTMENT_MAX_VALUE,
  }
  const normalizedValue = normalizeDigits(target.value)
  const maxValue = limits[field]

  if (!normalizedValue) {
    form[field] = ''
    return
  }

  const numericValue = Number(normalizedValue)
  form[field] = Number.isFinite(numericValue) ? String(Math.min(numericValue, maxValue)) : ''
}

function extractEntityId(payload: unknown) {
  if (payload && typeof payload === 'object' && 'id' in payload && typeof payload.id === 'number') {
    return payload.id
  }

  return null
}

function extractApiErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response

    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data

      if (data && typeof data === 'object' && 'errors' in data && Array.isArray(data.errors) && data.errors[0]) {
        const firstError = data.errors[0]

        if (firstError && typeof firstError === 'object' && 'message' in firstError && typeof firstError.message === 'string') {
          return firstError.message
        }
      }
    }
  }

  return error instanceof Error ? error.message : 'Не удалось оформить заказ.'
}

function validateForm() {
  if (items.value.length === 0) {
    return 'Корзина пуста.'
  }

  if (!form.street.trim()) {
    return 'Заполните адрес.'
  }

  if (form.clientName.trim().length > NAME_MAX_LENGTH) {
    return `Имя не должно быть длиннее ${NAME_MAX_LENGTH} символов.`
  }

  if (form.street.trim().length > ADDRESS_MAX_LENGTH) {
    return `Адрес не должен быть длиннее ${ADDRESS_MAX_LENGTH} символов.`
  }

  if (form.comment.trim().length > COMMENT_MAX_LENGTH) {
    return `Комментарий не должен быть длиннее ${COMMENT_MAX_LENGTH} символов.`
  }

  if (!form.isPrivateHouse) {
    if (!form.entrance.trim()) {
      return 'Заполните подъезд.'
    }

    if (!form.floor.trim()) {
      return 'Заполните этаж.'
    }

    if (!form.apartment.trim()) {
      return 'Заполните квартиру.'
    }

    if (!/^\d+$/.test(form.entrance) || Number(form.entrance) > ENTRANCE_MAX_VALUE) {
      return `Подъезд должен содержать только цифры и быть меньше 99.`
    }

    if (!/^\d+$/.test(form.floor) || Number(form.floor) > FLOOR_MAX_VALUE) {
      return `Этаж должен содержать только цифры и быть меньше 99.`
    }

    if (!/^\d+$/.test(form.apartment) || Number(form.apartment) > APARTMENT_MAX_VALUE) {
      return `Квартира должна содержать только цифры и быть меньше 9999.`
    }
  }

  if (!form.clientName.trim() || !form.clientPhone.trim()) {
    return 'Заполните контактные данные.'
  }

  return ''
}

async function submitOrder() {
  errorMessage.value = ''

  if (isOrderingClosed.value) {
    successMessage.value = 'К сожалению, мы уже закрыты.'
    isSuccessModalOpen.value = true
    return
  }

  const validationError = validateForm()

  if (validationError) {
    errorMessage.value = validationError
    return
  }

  isSubmitting.value = true

  try {
    const freshSiteSettings = await siteSettingsStore.loadSiteSettings(true)

    if (freshSiteSettings?.isClosed) {
      successMessage.value = 'К сожалению, мы уже закрыты.'
      isSuccessModalOpen.value = true
      return
    }

    const orderResponse = await createOrder({
      client_name: form.clientName.trim(),
      client_phone: form.clientPhone.trim(),
      address: fullAddress.value,
      comment: form.comment.trim(),
      pay_option: form.payOption,
      status: 'Оформлен',
      creation_time: getCurrentTime(),
      total_price: totalPrice.value,
    })

    const orderId = extractEntityId(orderResponse.data.data)
    if (orderId === null) {
      throw new Error('Не удалось получить id заказа.')
    }

    await Promise.all(
      items.value.map((item) =>
        createOrderItem({
          order: orderId,
          product: item.product,
          quantity: item.quantity,
          name_snapshot: item.name_snapshot,
          price_snapshot: item.price_snapshot,
          total_price: item.total_price,
        }),
      ),
    )

    cartStore.clearCart()
    successMessage.value = 'Ваш заказ успешно оформлен. Скоро вам позвонит менеджер для подтверждения.'
    isSuccessModalOpen.value = true
  } catch (error) {
    errorMessage.value = extractApiErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>

  <section class="main-section" id="order-area">

    <HomePageButton />
    <span class="title">Оформление заказа</span>

    <form id="order-form" c class="section-area" @submit.prevent="submitOrder">
      <h2 class="order-form__subtitle">Адрес</h2>

      <div class="order-form__grid">
        <label class="order-form__field" id="address">
          <span>Улица, дом</span>
          <input v-model="form.street" type="text" autocomplete="street-address" placeholder="Ленина, 12"
            :maxlength="ADDRESS_MAX_LENGTH">
        </label>
      </div>

      <label class="order-form__checkbox">
        <input v-model="form.isPrivateHouse" type="checkbox" @change="form.isPrivateHouse && clearApartmentFields()">
        <span>Частный дом</span>
      </label>

      <div v-if="!form.isPrivateHouse" class="order-form__grid">
        <label class="order-form__field" id="enter">
          <span>Подъезд</span>
          <input v-model="form.entrance" type="text" inputmode="numeric" placeholder="2" maxlength="2"
            @input="onApartmentFieldInput('entrance', $event)">
        </label>

        <label class="order-form__field" id="floor">
          <span>Этаж</span>
          <input v-model="form.floor" type="text" inputmode="numeric" placeholder="5" maxlength="2"
            @input="onApartmentFieldInput('floor', $event)">
        </label>

        <label class="order-form__field" id="apartment">
          <span>Квартира</span>
          <input v-model="form.apartment" type="text" inputmode="numeric" placeholder="47" maxlength="4"
            @input="onApartmentFieldInput('apartment', $event)">
        </label>
      </div>

      <h2 class="order-form__subtitle">Контакты</h2>

      <div class="order-form__grid">
        <label class="order-form__field" id="name">
          <span>Имя</span>
          <input v-model="form.clientName" type="text" autocomplete="name" placeholder="Иван"
            :maxlength="NAME_MAX_LENGTH">
        </label>

        <label class="order-form__field" id="phone">
          <span>Телефон</span>
          <input :value="form.clientPhone" type="tel" inputmode="tel" autocomplete="tel"
            placeholder="+7 (999) 123-45-67" maxlength="18" @focus="onPhoneFocus" @blur="onPhoneBlur"
            @keydown="onPhoneKeydown" @input="onPhoneInput">
        </label>
      </div>

      <h2 class="order-form__subtitle">Детали</h2>
      <label class="order-form__field">
        <span>Комментарий</span>
        <textarea v-model="form.comment" rows="4" placeholder="Позвоните за 10 минут"
          :maxlength="COMMENT_MAX_LENGTH" />
      </label>
      <div class="order-form__field">
        <div class="order-form__radio-group">

          <label class="order-form__radio">
            <input v-model="form.payOption" type="radio" value="Картой">
            <span>Картой курьеру</span>
          </label>

          <label class="order-form__radio">
            <input v-model="form.payOption" type="radio" value="Наличными">
            <span>Наличными курьеру</span>
          </label>
        </div>
      </div>



      <div class="order-form__summary">
        <span>Сумма заказа</span>
        <span>{{ formattedTotalPrice }} ₽</span>
      </div>

      <p v-if="errorMessage" class="order-form__error">{{ errorMessage }}</p>
    </form>

    <button
      class="order-form__submit"
      :class="{ 'order-form__submit--closed': isOrderingClosed }"
      type="submit"
      form="order-form"
      :disabled="isSubmitting || items.length === 0 || isOrderingClosed"
    >
      {{ isSubmitting ? 'Отправка...' : 'Оформить' }}
    </button>

    <div v-if="isSuccessModalOpen" class="order-modal">
      <div class="order-modal__content">
        <p style="text-align: center;">{{ successMessage }}</p>
        <button class="order-modal__button" type="button" @click="isSuccessModalOpen = false">
          Закрыть
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
label>span {
  font-size: calc(var(--font-size-normal)*0.7);
}

.order-page__title,
.order-form__subtitle {
  font-size: var(--font-size-normal);
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: var(--grid-vertical-gap);
}

#address {
  grid-column: span 6;
}

#enter,
#floor,
#apartment {
  grid-column: span 2;
}

#name,
#phone {
  grid-column: span 3;
}

.order-form__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--small-gap);
}

.order-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-form__field input,
.order-form__field textarea {
  padding: var(--small-gap);
  border: 1px solid var(--color-border-default);
  border-radius: calc(var(--radius) / 2);
  background-color: transparent;
  font-size: calc(var(--font-size-normal)*0.8);
  transition: border-color 0.2s ease;
}

.order-form__field input:focus,
.order-form__field textarea:focus {
  outline: none;
  border-color: var(--color-hover);
}

.order-form__checkbox,
.order-form__radio {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  gap: var(--small-gap);
}

.order-form__radio,
.order-form__checkbox {
  position: relative;
  padding: var(--small-gap) calc(var(--small-gap) * 2) var(--small-gap) 0;
  transition: color 0.2s ease;
}

.order-form__checkbox input,
.order-form__radio input {
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: pointer;
}

.order-form__checkbox::before,
.order-form__radio::before {
  content: '';
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border: 1px solid var(--color-border-default);
  background-color: transparent;
}

.order-form__checkbox::before {
  border-radius: 4px;
}

.order-form__radio::before {
  border-radius: 50%;
}

.order-form__checkbox::after,
.order-form__radio::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 50%;
  width: 12px;
  height: 12px;
  opacity: 0;
  transform: translateY(-50%);
  background-color: var(--color-primary);
  transition: opacity 0.2s ease;
}

.order-form__checkbox::after {
  border-radius: 2px;
}

.order-form__radio::after {
  border-radius: 50%;
}

.order-form__checkbox:has(input:checked)::after,
.order-form__radio:has(input:checked)::after {
  opacity: 1;
}

.order-form__checkbox:has(input:focus-visible),
.order-form__radio:has(input:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.order-form__checkbox {
  width: 40%;
  width: 150px;
}

.order-form__radio-group {
  display: flex;
  align-items: center;
  gap: var(--normal-gap);
}

.order-form__summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--normal-gap);
  font-size: var(--font-size-h2);
}

.order-form__error {
  color: var(--color-primary);
}

.order-form__submit,
.order-modal__button {
  display: inline-flex;
  width: 250px;
  margin: auto;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border: none;
  border-radius: calc(var(--radius) / 2);
  background-color: var(--color-primary);
  color: white;
  font-size: var(--font-size-h2);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.order-form__submit:hover:not(:disabled) {
  background-color: var(--color-hover);
}

.order-form__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.order-form__submit--closed {
  background-color: var(--color-text-secondary);
}

.order-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--section-padding);
  background-color: rgb(0 0 0 / 35%);
}

.order-modal__content {
  display: flex;
  flex-direction: column;
  gap: var(--normal-gap);
  max-width: 520px;
  padding: var(--section-padding);
  border-radius: var(--radius);
  background-color: white;
}

@media (max-width: 900px) {

  #name,
  #phone {
    grid-column: span 6;
  }

  .order-form__radio-group {
    flex-direction: column;
    align-items: start;
    gap: 4px;
  }
}
</style>
