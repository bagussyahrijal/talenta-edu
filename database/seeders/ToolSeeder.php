<?php

namespace Database\Seeders;

use App\Models\Tool;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class ToolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tools = [
            [
                'name' => 'Google Analytics',
                'slug' => Str::slug('Google Analytics'),
                'description' => 'Web Analytics Service',
                'icon' => null,
            ],
            [
                'name' => 'QuickBooks',
                'slug' => Str::slug('QuickBooks'),
                'description' => 'Accounting Software',
                'icon' => null,
            ],
            [
                'name' => 'Excel',
                'slug' => Str::slug('Excel'),
                'description' => 'Spreadsheet Software',
                'icon' => null,
            ],
        ];

        foreach ($tools as $tool) {
            Tool::firstOrCreate(['name' => $tool['name']], $tool);
        }
    }
}
