# BLACK TIGER AUDIO — cinematic web suite (v1)

Это статический сайт (без сборки). Можно залить на GitHub Pages.

## Структура
- `/index.html` — основной сайт усилителей
- `/data.json` — ссылки/цены/рейтинги для основного сайта
- `/invest/` — инвест-страница
- `/invest/data.json` — данные инвест-страницы
- `/invest/deck.pdf` — PDF deck (кнопка Deck PDF открывает этот файл)

## Как развернуть на GitHub Pages
1) Откройте репозиторий сайта.
2) Скопируйте содержимое архива в корень репозитория.
3) Убедитесь, что в репозитории есть папка `invest/` и файл `invest/deck.pdf`.
4) В настройках GitHub Pages выберите ветку/папку (обычно `main` + `/root`).

## Что менять в первую очередь
### 1) Ссылки на маркетплейсы и Telegram
Файл: `/data.json`
- `brand.links.wb_storm`, `ozon_storm`, `wb_gale`, `ozon_gale`
- `brand.links.telegram_channel`, `telegram_contact`

### 2) Инвест-цифры и контакты
Файл: `/invest/data.json`
- `metrics.delivered`, `metrics.gmv`, `metrics.payout`, `metrics.rating`
- `ask.amount`, `ask.use`
- `brand.links.email`, `telegram_*`

### 3) Deck PDF
Файл должен лежать строго здесь:
- `/invest/deck.pdf`

Если файл называется иначе — поменяйте `brand.links.deck` в `/invest/data.json`.

## Примечание
Скрин Telegram в `assets/tg-review.png` обрезан, чтобы не светить личные данные.
Если захотите — замените на скрин из канала/поста или на коллаж отзывов.