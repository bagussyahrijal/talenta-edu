<?php

use App\Models\User;
use Database\Seeders\StaffPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'staff']);
    Role::firstOrCreate(['name' => 'mentor']);
    Role::firstOrCreate(['name' => 'affiliate']);
    Role::firstOrCreate(['name' => 'user']);

    $this->seed(StaffPermissionSeeder::class);
});

test('staff permission seeder creates all required permissions', function () {
    $expectedPermissions = [
        'users.view', 'users.manage',
        'affiliates.view', 'affiliates.manage',
        'mentors.view', 'mentors.manage',
        'courses.view', 'courses.manage',
        'bootcamps.view', 'bootcamps.manage',
        'webinars.view', 'webinars.manage',
        'certification-programs.view', 'certification-programs.manage',
        'bundles.view', 'bundles.manage',
        'categories.view', 'categories.manage',
        'tools.view', 'tools.manage',
        'certificates.view', 'certificates.manage',
        'discount-codes.view', 'discount-codes.manage',
        'promotions.view', 'promotions.manage',
        'broadcasts.view', 'broadcasts.manage',
        'transactions.view', 'transactions.manage',
        'articles.view', 'articles.manage',
        'referral.view', 'referral.manage',
        'earnings.view', 'earnings.manage',
    ];

    foreach ($expectedPermissions as $permission) {
        expect(Permission::where('name', $permission)->exists())->toBeTrue();
    }
});

test('admin can create staff and assign permissions', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post(route('staff.store'), [
        'name' => 'Staff Test',
        'email' => 'staff@example.com',
        'phone_number' => '08123456789',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'permissions' => ['courses.view', 'courses.manage', 'webinars.view'],
    ]);

    $response->assertRedirect(route('staff.index'));

    $staff = User::where('email', 'staff@example.com')->first();
    expect($staff)->not->toBeNull();
    expect($staff->hasRole('staff'))->toBeTrue();
    expect($staff->hasPermissionTo('courses.view'))->toBeTrue();
    expect($staff->hasPermissionTo('courses.manage'))->toBeTrue();
    expect($staff->hasPermissionTo('webinars.view'))->toBeTrue();
    expect($staff->hasPermissionTo('articles.view'))->toBeFalse();
});

test('admin can update staff details and permissions', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $staff = User::factory()->create(['name' => 'Old Name', 'email' => 'old@example.com', 'phone_number' => '08123456780']);
    $staff->assignRole('staff');
    $staff->givePermissionTo(['courses.view']);

    $response = $this->actingAs($admin)->put(route('staff.update', $staff->id), [
        'name' => 'New Name',
        'email' => 'new@example.com',
        'phone_number' => '08123456781',
        'permissions' => ['articles.view', 'articles.manage'],
    ]);

    $response->assertRedirect(route('staff.index'));

    $staff->refresh();
    expect($staff->name)->toBe('New Name');
    expect($staff->email)->toBe('new@example.com');
    expect($staff->hasPermissionTo('courses.view'))->toBeFalse();
    expect($staff->hasPermissionTo('articles.view'))->toBeTrue();
    expect($staff->hasPermissionTo('articles.manage'))->toBeTrue();
});

test('staff user cannot access staff management routes', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');

    $this->actingAs($staff)->get(route('staff.index'))->assertForbidden();
    $this->actingAs($staff)->get(route('staff.create'))->assertForbidden();
});

test('staff user can access admin dashboard and gets staff stats', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo(['courses.view']);

    $response = $this->actingAs($staff)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/dashboard/index')
        ->has('stats')
        ->has('stats.accessible_modules')
    );
});

test('staff with view permission can access module index but not create without manage permission', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo(['courses.view']);

    // Can access index
    $this->actingAs($staff)->get(route('courses.index'))->assertOk();

    // Cannot access create without courses.manage
    $this->actingAs($staff)->get(route('courses.create'))->assertForbidden();
});

test('staff with manage permission can access module create page', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo(['courses.view', 'courses.manage']);

    $this->actingAs($staff)->get(route('courses.index'))->assertOk();
    $this->actingAs($staff)->get(route('courses.create'))->assertOk();
});

test('staff without module permission gets 403 forbidden', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo(['courses.view']);

    // Does not have webinars.view permission
    $this->actingAs($staff)->get(route('webinars.index'))->assertForbidden();
    $this->actingAs($staff)->get(route('articles.index'))->assertForbidden();
});

test('auth permissions are shared to inertia props for staff', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo(['courses.view', 'courses.manage', 'articles.view']);

    $response = $this->actingAs($staff)->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('auth.role', ['staff'])
        ->where('auth.permissions', function ($permissions) {
            $perms = collect($permissions);
            return $perms->contains('courses.view') &&
                $perms->contains('courses.manage') &&
                $perms->contains('articles.view') &&
                !$perms->contains('webinars.view');
        })
    );
});
