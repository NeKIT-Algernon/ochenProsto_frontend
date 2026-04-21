# OchenProsto Frontend

Frontend для сайта доставки еды на `Vue 3` + `TypeScript` + `Vite`.

Сейчас в проекте:
- базовый layout приложения
- роутинг для 4 страниц
- API-слой для работы с Directus
- тестовый вывод категорий, баннеров, товаров и `site_settings`

## Стек

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios

## Запуск

Установить зависимости:

```bash
npm install
```

Создать локальный env-файл:

```bash
cp .env.example .env
```

Запустить dev-сервер:

```bash
npm run dev
```

Проверить типы:

```bash
npm run type-check
```

Собрать production-бандл:

```bash
npm run build
```

## Переменные окружения

Используется одна обязательная переменная:

```env
VITE_DIRECTUS_URL=http://localhost:8055
```

## Роуты

- `/` — главная страница
- `/product` — страница товара
- `/cart` — корзина
- `/order` — оформление заказа

## API

API-слой лежит в [src/api](./src/api) и использует общий клиент [src/api/client.ts](./src/api/client.ts).

Текущие методы:
- `getCategories()`
- `getBanners()`
- `getProductsByCategory(categoryId)`
- `getSiteSettings()`
- `getAssetUrl(fileId)`

## Структура

Основные директории:
- `src/api` — запросы к Directus и типы
- `src/pages` — страницы
- `src/components/layout` — layout-компоненты
- `src/components/general` — общие UI-компоненты
- `src/components/page_components` — компоненты по страницам
- `src/assets/styles` — CSS-переменные

## Текущее состояние

Главная страница уже запрашивает:
- баннеры
- категории
- товары по категориям

Страница товара запрашивает:
- `site_settings`
