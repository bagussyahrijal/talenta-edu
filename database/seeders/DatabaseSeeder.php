<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'affiliate']);
        Role::firstOrCreate(['name' => 'mentor']);
        Role::firstOrCreate(['name' => 'user']);

        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'phone_number' => '089528514480',
            'bio' => 'Admin Ganteng',
            'password' => bcrypt('M@lang2025'),
        ]);

        $adminAffiliate = User::factory()->create([
            'name' => 'Talenta Affiliate',
            'email' => 'talenta.affiliate@gmail.com',
            'phone_number' => '089528514480',
            'bio' => "Talenta's Affiliate",
            'password' => bcrypt('talenta2025'),
            'affiliate_code' => 'TAL2025',
            'affiliate_status' => 'Active',
            'commission' => 15,
        ]);

        $admin->assignRole('admin');
        $adminAffiliate->assignRole('affiliate');

        $this->call([
            ToolSeeder::class,
            CategorySeeder::class,
        ]);
    }
}
