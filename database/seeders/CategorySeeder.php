<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Digital Marketing',
                'slug' => Str::slug('Digital Marketing'),
            ],
            [
                'name' => 'Accounting & Finance',
                'slug' => Str::slug('Accounting & Finance'),
            ],
            [
                'name' => 'Design & Creative',
                'slug' => Str::slug('Design & Creative'),
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}
