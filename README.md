# Help-Desk система

## Описание
Система для управления заявками в службе технической поддержки.

## Технологии
- **Frontend**: Vue.js 3, Pinia, Vue Router, Axios
- **Backend**: Laravel 8, PostgreSQL, Sanctum

## Установка и запуск

### Backend
```bash
cd backend
cp .env.example .env
# Настройте подключение к PostgreSQL в .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000