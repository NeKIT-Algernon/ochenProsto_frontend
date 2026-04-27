# Очень Просто Frontend

Фронтенд интернет-магазина доставки еды для проекта «Очень Просто».  
Приложение написано на `Vue 3` + `TypeScript` + `Vite`, работает с `Directus API`, поддерживает корзину, оформление заказа, SEO-метаданные и production-сборку для размещения на обычном статическом хостинге.

## Что уже реализовано

- главная страница с баннерами, категориями и каталогом товаров
- страница товара с описанием, составом, КБЖУ и блоком «Посмотрите также»
- корзина с хранением в `localStorage`
- страница оформления заказа с клиентской валидацией
- SEO-метаданные и генерация `robots.txt` / `sitemap.xml`
- `history`-роутинг через `Vue Router`
- skeleton-загрузчики и неблокирующий первый рендер

## Стек

- `Vue 3`
- `TypeScript`
- `Vite`
- `Vue Router`
- `Pinia`
- `Axios`

## Структура проекта

```text
src/
  api/                слой запросов к Directus
  assets/             шрифты, иконки, глобальные стили
  components/         layout и переиспользуемые компоненты
  components/page_components/
                      компоненты, сгруппированные по страницам
  pages/              страницы приложения
  router/             маршруты
  stores/             Pinia stores
  utils/              вспомогательная логика, включая SEO
public/               статические файлы, robots.txt, sitemap.xml
scripts/              служебные скрипты сборки
```

## Основные сценарии

### Главная страница

- загружает баннеры
- загружает категории и товары
- поддерживает фильтрацию по категориям
- показывает карточки товаров и добавление в корзину

### Страница товара

- загружает товар по `id`
- показывает подробную информацию
- позволяет добавить товар в корзину
- показывает случайные рекомендации без повторов

### Корзина

- хранит товары в `localStorage`
- позволяет менять количество и удалять позиции
- считает итоговую сумму

### Оформление заказа

- валидирует поля формы на клиенте
- создаёт заказ и связанные позиции через API
- показывает ошибки валидации и API

## Переменные окружения

Создайте `.env` на основе `.env.example`.

Обязательные переменные:

```env
VITE_DIRECTUS_URL=https://api.example.com
VITE_SITE_URL=https://example.com
VITE_SITE_NAME=Очень Просто
VITE_APP_BASE_PATH=/
```

Пояснения:

- `VITE_DIRECTUS_URL` — базовый URL Directus API
- `VITE_SITE_URL` — публичный домен фронтенда, используется для `canonical`, `robots.txt` и `sitemap.xml`
- `VITE_SITE_NAME` — имя сайта для SEO
- `VITE_APP_BASE_PATH` — путь, если сайт разворачивается не в корень домена, а в подпапку

## Локальный запуск

Установка зависимостей:

```bash
npm install
```

Создание env:

```bash
cp .env.example .env
```

Запуск dev-сервера:

```bash
npm run dev
```

Проверка типов:

```bash
npm run type-check
```

Production-сборка:

```bash
npm run build
```

## Production и деплой

Во время `npm run build` проект:

- генерирует `public/robots.txt`
- генерирует `public/sitemap.xml`
- собирает production-бандл в `dist/`

### Важно для history-router

Проект использует `createWebHistory`, поэтому хостинг должен перенаправлять неизвестные маршруты на `index.html`.

Пример для `Nginx`:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Пример для `Apache`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## SEO

В проекте уже настроено:

- route-based `title` и `description`
- `canonical`
- `robots`
- `Open Graph`
- `noindex` для `/cart` и `/order`
- динамический SEO для страницы товара

Текущее ограничение:

- `sitemap.xml` пока содержит только корневую страницу
- если нужно полноценное SEO по карточкам товаров, следующим этапом стоит генерировать sitemap динамически по каталогу или добавлять SSR / prerender

## Производительность

Уже сделано:

- lazy-load страниц через router
- неблокирующий старт приложения без ожидания `site_settings`
- skeleton для первого экрана и route fallback
- единый компонент изображений с плавным появлением после загрузки
- сокращение числа запросов на главной странице
- кэш `site_settings` в `localStorage`

## Скрипты

```bash
npm run dev
npm run build
npm run preview
npm run type-check
npm run lint
npm run format
npm run generate:seo
```

## Текущие роуты

- `/` — главная
- `/product/:id` — карточка товара
- `/cart` — корзина
- `/order` — оформление заказа
- `/:pathMatch(.*)*` — 404

## Зависимости от backend

Фронтенд ожидает от Directus:

- коллекцию товаров
- коллекцию категорий
- баннеры
- `site_settings`
- создание заказов и позиций заказа
- доступные asset URLs для изображений

Если в данных встречаются отсутствующие связи или невалидные `id`, интерфейс старается не падать, но такие данные всё равно стоит чинить на backend-стороне.

## Разработка

Если меняется структура API, сначала обновляйте:

- `src/api/types.ts`
- `src/api/*`
- логику страниц и stores, завязанных на эти поля

Если проект деплоится на новый домен, проверьте:

- `.env`
- `robots.txt`
- `sitemap.xml`
- `canonical`
- CORS на стороне Directus
