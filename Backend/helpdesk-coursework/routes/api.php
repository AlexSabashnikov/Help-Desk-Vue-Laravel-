<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Тестовый маршрут
Route::get('/test', function() {
    return response()->json(['message' => 'API работает!', 'status' => 'success']);
});

// Получение CSRF токена
Route::get('/get_token', function() {
    return response()->json(['token' => csrf_token()]);
});

// Логин
Route::post('/login', function(Request $request) {
    $request->validate([
        'login' => 'required|string',
        'password' => 'required|string',
    ]);

    $user = User::where('login', $request->login)
                ->orWhere('email', $request->login)
                ->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'validator_fails' => 'Неверный логин или пароль'
        ], 422);
    }

    $user->load('role');
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token
    ]);
});

// Защищенные маршруты
Route::middleware('auth:sanctum')->group(function () {
    // Загрузка пользователей (POST)
    Route::post('/users/load_users', function(Request $request) {
        $search = $request->user_search;
        $roles = $request->roles;
        
        $query = User::query();
        
        // Добавляем связь с ролью
        $query->with('role');
        
        // Фильтр по ролям
        if ($roles && !empty($roles)) {
            $query->whereIn('role_id', $roles);
        }
        
        // Поиск по имени или фамилии
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('login', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $users = $query->paginate(20);
        
        return response()->json($users);
    });
    
    // Загрузка организаций
    Route::post('/organizations/load_organizations', function(Request $request) {
        $search = $request->organization_search;
        
        $query = DB::table('organizations');
        
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }
        
        return response()->json($query->paginate(20));
    });
    
    // Загрузка объектов
    Route::post('/objects/load_objects', function(Request $request) {
        $search = $request->object_search;
        
        $query = DB::table('objects')
            ->leftJoin('organizations', 'objects.organization_id', '=', 'organizations.id')
            ->select('objects.*', 'organizations.name as organization_name');
        
        if ($search) {
            $query->where('objects.name', 'like', "%{$search}%");
        }
        
        return response()->json($query->paginate(20));
    });
    
    // Выход
    Route::post('/logout', function(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Успешный выход']);
    });
});
