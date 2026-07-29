<?php

use App\Models\User;
use App\Services\ReferralService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'user']);
});

test('referral service validates both affiliate_code and referral_code', function () {
    $referrer = User::factory()->create([
        'affiliate_code' => 'TAL2025',
        'referral_code' => 'TALE-123456',
    ]);

    $service = app(ReferralService::class);

    // Test with affiliate_code
    $result1 = $service->validateReferralCode('TAL2025');
    expect($result1['valid'])->toBeTrue();
    expect($result1['referrer']->id)->toBe($referrer->id);

    // Test with referral_code
    $result2 = $service->validateReferralCode('TALE-123456');
    expect($result2['valid'])->toBeTrue();
    expect($result2['referrer']->id)->toBe($referrer->id);

    // Test with invalid code
    $result3 = $service->validateReferralCode('INVALID');
    expect($result3['valid'])->toBeFalse();
});

test('registration accepts both affiliate_code and referral_code', function () {
    $referrer = User::factory()->create([
        'affiliate_code' => 'TAL2025',
        'referral_code' => 'TALE-123456',
    ]);

    // Test registering with affiliate_code
    $response1 = $this->post('/register', [
        'name' => 'User One',
        'email' => 'user1@example.com',
        'phone_number' => '08123456789',
        'instance' => 'Company',
        'city' => 'Jakarta',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'affiliate_code' => 'TAL2025',
    ]);

    $response1->assertRedirect();
    $user1 = User::where('email', 'user1@example.com')->first();
    expect($user1)->not->toBeNull();

    // Logout the registered user
    auth()->logout();

    // Test registering with referral_code
    $response2 = $this->post('/register', [
        'name' => 'User Two',
        'email' => 'user2@example.com',
        'phone_number' => '08123456780',
        'instance' => 'Company',
        'city' => 'Jakarta',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'affiliate_code' => 'TALE-123456',
    ]);

    $response2->assertRedirect();
    $user2 = User::where('email', 'user2@example.com')->first();
    expect($user2)->not->toBeNull();
});

test('registration rejects invalid affiliate_code', function () {
    $response = $this->post('/register', [
        'name' => 'User Three',
        'email' => 'user3@example.com',
        'phone_number' => '08123456781',
        'instance' => 'Company',
        'city' => 'Jakarta',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'affiliate_code' => 'INVALID_CODE',
    ]);

    $response->assertSessionHasErrors(['affiliate_code']);
});
