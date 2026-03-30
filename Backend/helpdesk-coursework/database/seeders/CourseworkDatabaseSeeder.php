<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CourseworkDatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Роли
        DB::table('roles')->insert([
            ['name' => 'Администратор', 'slug' => 'admin', 'description' => 'Полный доступ', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Диспетчер', 'slug' => 'dispatcher', 'description' => 'Управление заявками', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Инженер', 'slug' => 'engineer', 'description' => 'Выполнение заявок', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Клиент', 'slug' => 'client', 'description' => 'Создание заявок', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Пользователи
        DB::table('users')->insert([
            [
                'first_name' => 'Иван',
                'last_name' => 'Иванов',
                'login' => 'admin',
                'email' => 'admin@helpdesk.com',
                'password' => Hash::make('admin123'),
                'role_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Петр',
                'last_name' => 'Петров',
                'login' => 'dispatcher',
                'email' => 'dispatcher@helpdesk.com',
                'password' => Hash::make('admin123'),
                'role_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Сергей',
                'last_name' => 'Сергеев',
                'login' => 'engineer',
                'email' => 'engineer@helpdesk.com',
                'password' => Hash::make('admin123'),
                'role_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Анна',
                'last_name' => 'Сидорова',
                'login' => 'client',
                'email' => 'client@helpdesk.com',
                'password' => Hash::make('admin123'),
                'role_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 3. Организации
        DB::table('organizations')->insert([
            ['name' => 'ООО "Ромашка"', 'description' => 'Основной клиент', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'ЗАО "ТехноСервис"', 'description' => 'IT-компания', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'ИП "СтройМаркет"', 'description' => 'Строительные материалы', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 4. Объекты
        DB::table('objects')->insert([
            ['name' => 'Главный офис', 'description' => 'Центральный офис', 'organization_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Склад №1', 'description' => 'Склад продукции', 'organization_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Серверная', 'description' => 'Дата-центр', 'organization_id' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 5. Телефоны
        DB::table('phones')->insert([
            ['phone_number' => '+7(999)111-22-33', 'user_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['phone_number' => '+7(999)222-33-44', 'user_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['phone_number' => '+7(999)333-44-55', 'user_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['phone_number' => '+7(999)444-55-66', 'user_id' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 6. Связи пользователей с организациями
        DB::table('user_organizations')->insert([
            ['user_id' => 1, 'organization_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 1, 'organization_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 1, 'organization_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 2, 'organization_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 3, 'organization_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 4, 'organization_id' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 7. Заявки
        for ($i = 1; $i <= 10; $i++) {
            DB::table('tickets')->insert([
                'title' => "Заявка №{$i}",
                'description' => "Описание заявки номер {$i}",
                'status' => ['new', 'in_progress', 'resolved', 'closed'][array_rand(['new', 'in_progress', 'resolved', 'closed'])],
                'priority' => ['low', 'medium', 'high', 'urgent'][array_rand(['low', 'medium', 'high', 'urgent'])],
                'user_id' => 4,
                'assigned_to' => 3,
                'object_id' => rand(1, 3),
                'organization_id' => rand(1, 3),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ База данных успешно заполнена!');
        $this->command->info('📝 Пользователи для входа:');
        $this->command->info('   admin / admin123 (Администратор)');
        $this->command->info('   dispatcher / admin123 (Диспетчер)');
        $this->command->info('   engineer / admin123 (Инженер)');
        $this->command->info('   client / admin123 (Клиент)');
    }
}
