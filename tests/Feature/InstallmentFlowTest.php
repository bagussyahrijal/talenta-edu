<?php

namespace Tests\Feature;

use App\Models\Bootcamp;
use App\Models\Category;
use App\Models\EnrollmentBootcamp;
use App\Models\Invoice;
use App\Models\ProductInstallmentTerm;
use App\Models\User;
use App\Services\MidtransService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InstallmentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Bootcamp $bootcamp;
    protected ProductInstallmentTerm $term1;
    protected ProductInstallmentTerm $term2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'staff']);
        Role::firstOrCreate(['name' => 'mentor']);
        Role::firstOrCreate(['name' => 'affiliate']);
        Role::firstOrCreate(['name' => 'user']);

        $this->user = User::factory()->create([
            'email_verified_at' => now(),
            'phone_number' => '081234567890',
            'instance' => 'Test University',
            'city' => 'Jakarta',
        ]);
        $this->user->assignRole('user');

        $category = Category::create(['name' => 'Tax Tech', 'slug' => 'tax-tech']);
        $this->bootcamp = Bootcamp::create([
            'title' => 'Talenta Bootcamp Pajak',
            'slug' => 'talenta-bootcamp-pajak',
            'category_id' => $category->id,
            'price' => 1000000,
            'strikethrough_price' => 1500000,
            'status' => 'published',
            'installment_enabled' => true,
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(40),
        ]);

        $this->term1 = ProductInstallmentTerm::create([
            'termable_type' => Bootcamp::class,
            'termable_id' => $this->bootcamp->id,
            'term_number' => 1,
            'amount' => 500000,
            'due_date' => Carbon::now()->addDays(3)->toDateString(),
        ]);

        $this->term2 = ProductInstallmentTerm::create([
            'termable_type' => Bootcamp::class,
            'termable_id' => $this->bootcamp->id,
            'term_number' => 2,
            'amount' => 500000,
            'due_date' => Carbon::now()->addDays(30)->toDateString(),
        ]);
    }

    public function test_user_can_create_installment_invoice_and_receive_payment_url(): void
    {
        $mockMidtrans = Mockery::mock(MidtransService::class);
        $mockMidtrans->shouldReceive('createTransaction')
            ->once()
            ->andReturn([
                'success' => true,
                'snap_token' => 'mock-snap-token-1',
                'redirect_url' => 'https://app.midtrans.com/snap/v2/vtweb/mock-snap-token-1',
            ]);
        $this->app->instance(MidtransService::class, $mockMidtrans);

        $response = $this->actingAs($this->user)->postJson(route('installment.store'), [
            'type' => 'bootcamp',
            'id' => $this->bootcamp->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'payment_url' => 'https://app.midtrans.com/snap/v2/vtweb/mock-snap-token-1',
            'snap_token' => 'mock-snap-token-1',
            'dp_amount' => 500000,
            'total_terms' => 2,
        ]);

        $parentInvoiceId = $response->json('invoice_id');
        $parentInvoice = Invoice::findOrFail($parentInvoiceId);

        $this->assertEquals($this->user->id, $parentInvoice->user_id);
        $this->assertTrue($parentInvoice->is_installment);
        $this->assertEquals('installment_pending', $parentInvoice->status);
        $this->assertEquals(1000000, $parentInvoice->amount);

        // Term child invoices
        $childInvoices = Invoice::where('parent_invoice_id', $parentInvoice->id)->orderBy('installment_number')->get();
        $this->assertCount(2, $childInvoices);

        $child1 = $childInvoices[0];
        $this->assertEquals(1, $child1->installment_number);
        $this->assertEquals(500000, $child1->amount);
        $this->assertEquals('pending', $child1->status);
        $this->assertEquals('https://app.midtrans.com/snap/v2/vtweb/mock-snap-token-1', $child1->invoice_url);

        $child2 = $childInvoices[1];
        $this->assertEquals(2, $child2->installment_number);
        $this->assertEquals(500000, $child2->amount);
        $this->assertEquals('pending', $child2->status);

        // Enrollment exists
        $this->assertDatabaseHas('enrollment_bootcamps', [
            'invoice_id' => $parentInvoice->id,
            'bootcamp_id' => $this->bootcamp->id,
        ]);
    }

    public function test_midtrans_callback_marks_term_1_paid_and_grants_access(): void
    {
        config(['midtrans.server_key' => 'test-server-key']);

        $parentInvoice = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000001',
            'amount' => 1000000,
            'nett_amount' => 1000000,
            'status' => 'installment_pending',
            'is_installment' => true,
        ]);

        $child1 = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000001-T1',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'pending',
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term1->id,
            'installment_number' => 1,
            'payment_reference' => 'TLT-26000001-T1',
        ]);

        Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000001-T2',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'pending',
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term2->id,
            'installment_number' => 2,
        ]);

        EnrollmentBootcamp::create([
            'invoice_id' => $parentInvoice->id,
            'bootcamp_id' => $this->bootcamp->id,
            'price' => 1000000,
        ]);

        // Before payment: purchasedByUser returns 0
        $this->assertEquals(0, Invoice::purchasedByUser($this->user->id)->count());

        // Simulate Midtrans callback for Term 1
        $grossAmount = '500000.00';
        $signature = hash('sha512', $child1->invoice_code . '200' . $grossAmount . 'test-server-key');

        $response = $this->postJson(route('midtrans.callback'), [
            'order_id' => $child1->invoice_code,
            'status_code' => '200',
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
            'payment_type' => 'bank_transfer',
            'settlement_time' => now()->toDateTimeString(),
        ]);

        $response->assertStatus(200);

        // Assert term 1 is paid
        $child1->refresh();
        $this->assertEquals('paid', $child1->status);
        $this->assertNotNull($child1->paid_at);

        // Assert parent invoice is still installment_pending
        $parentInvoice->refresh();
        $this->assertEquals('installment_pending', $parentInvoice->status);

        // Assert user access is granted!
        $this->assertEquals(1, Invoice::purchasedByUser($this->user->id)->count());

        // Active installment data is present
        $activeInstallment = Invoice::getActiveInstallmentForUser($this->user->id, 'bootcamp', $this->bootcamp->id);
        $this->assertNotNull($activeInstallment);
        $this->assertEquals($parentInvoice->id, $activeInstallment['id']);
        $this->assertEquals(2, $activeInstallment['next_unpaid_term']['installment_number']);
    }

    public function test_user_can_pay_next_term_and_completing_all_terms_marks_parent_paid(): void
    {
        config(['midtrans.server_key' => 'test-server-key']);

        $parentInvoice = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000002',
            'amount' => 1000000,
            'nett_amount' => 1000000,
            'status' => 'installment_pending',
            'is_installment' => true,
        ]);

        $child1 = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000002-T1',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'paid',
            'paid_at' => now(),
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term1->id,
            'installment_number' => 1,
            'payment_reference' => 'TLT-26000002-T1',
        ]);

        $child2 = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000002-T2',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'pending',
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term2->id,
            'installment_number' => 2,
        ]);

        EnrollmentBootcamp::create([
            'invoice_id' => $parentInvoice->id,
            'bootcamp_id' => $this->bootcamp->id,
            'price' => 1000000,
        ]);

        // Mock Midtrans for paying Term 2
        $mockMidtrans = Mockery::mock(MidtransService::class);
        $mockMidtrans->shouldReceive('createTransaction')
            ->once()
            ->andReturn([
                'success' => true,
                'snap_token' => 'mock-snap-token-term-2',
                'redirect_url' => 'https://app.midtrans.com/snap/v2/vtweb/mock-snap-token-term-2',
            ]);
        $this->app->instance(MidtransService::class, $mockMidtrans);

        $payResponse = $this->actingAs($this->user)->postJson(route('installment.pay-term', $parentInvoice->id));
        $payResponse->assertStatus(200);
        $payResponse->assertJson([
            'success' => true,
            'payment_url' => 'https://app.midtrans.com/snap/v2/vtweb/mock-snap-token-term-2',
            'term_number' => 2,
        ]);

        // Simulate Midtrans callback for Term 2
        $grossAmount = '500000.00';
        $signature = hash('sha512', $child2->invoice_code . '200' . $grossAmount . 'test-server-key');

        $callbackResponse = $this->postJson(route('midtrans.callback'), [
            'order_id' => $child2->invoice_code,
            'status_code' => '200',
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
            'payment_type' => 'bank_transfer',
            'settlement_time' => now()->toDateTimeString(),
        ]);

        $callbackResponse->assertStatus(200);

        // Assert term 2 is paid
        $child2->refresh();
        $this->assertEquals('paid', $child2->status);

        // Assert parent invoice is now PAID!
        $parentInvoice->refresh();
        $this->assertEquals('paid', $parentInvoice->status);
        $this->assertNotNull($parentInvoice->paid_at);

        // Active installment is now marked fully paid
        $activeInstallment = Invoice::getActiveInstallmentForUser($this->user->id, 'bootcamp', $this->bootcamp->id);
        $this->assertNotNull($activeInstallment);
        $this->assertTrue($activeInstallment['is_fully_paid']);
        $this->assertNull($activeInstallment['next_term']);
    }

    public function test_check_email_returns_active_installment_for_user(): void
    {
        $parentInvoice = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000003',
            'amount' => 1000000,
            'nett_amount' => 1000000,
            'status' => 'installment_pending',
            'is_installment' => true,
        ]);

        Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000003-T1',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'paid',
            'paid_at' => now(),
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term1->id,
            'installment_number' => 1,
            'payment_reference' => 'TLT-26000003-T1',
        ]);

        Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000003-T2',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'pending',
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term2->id,
            'installment_number' => 2,
        ]);

        EnrollmentBootcamp::create([
            'invoice_id' => $parentInvoice->id,
            'bootcamp_id' => $this->bootcamp->id,
            'price' => 1000000,
        ]);

        $response = $this->postJson('/api/check-email', [
            'email' => $this->user->email,
            'bootcamp_id' => $this->bootcamp->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'exists' => true,
            'active_installment' => [
                'id' => $parentInvoice->id,
                'status' => 'installment_pending',
                'next_unpaid_term' => [
                    'installment_number' => 2,
                    'amount' => 500000,
                ],
            ],
        ]);
    }

    public function test_midtrans_callback_handles_timestamp_suffixed_order_id(): void
    {
        config(['midtrans.server_key' => 'test-server-key']);

        $parentInvoice = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000004',
            'amount' => 1000000,
            'nett_amount' => 1000000,
            'status' => 'installment_pending',
            'is_installment' => true,
        ]);

        $suffixedOrderId = 'TLT-26000004-T1-1712345678';

        $child1 = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000004-T1',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'pending',
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term1->id,
            'installment_number' => 1,
            'payment_reference' => $suffixedOrderId,
        ]);

        Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000004-T2',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'pending',
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term2->id,
            'installment_number' => 2,
        ]);

        EnrollmentBootcamp::create([
            'invoice_id' => $parentInvoice->id,
            'bootcamp_id' => $this->bootcamp->id,
            'price' => 1000000,
        ]);

        $grossAmount = '500000.00';
        $signature = hash('sha512', $suffixedOrderId . '200' . $grossAmount . 'test-server-key');

        $response = $this->postJson(route('midtrans.callback'), [
            'order_id' => $suffixedOrderId,
            'status_code' => '200',
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
            'payment_type' => 'bank_transfer',
            'settlement_time' => now()->toDateTimeString(),
        ]);

        $response->assertStatus(200);

        $child1->refresh();
        $this->assertEquals('paid', $child1->status);
    }

    public function test_user_can_pay_term_1_via_pay_term_when_previously_unpaid(): void
    {
        $parentInvoice = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000005',
            'amount' => 1000000,
            'nett_amount' => 1000000,
            'status' => 'installment_pending',
            'is_installment' => true,
        ]);

        $child1 = Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000005-T1',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'pending',
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term1->id,
            'installment_number' => 1,
            'invoice_url' => 'https://app.midtrans.com/snap/v2/vtweb/old-token',
        ]);

        Invoice::create([
            'user_id' => $this->user->id,
            'invoice_code' => 'TLT-26000005-T2',
            'amount' => 500000,
            'nett_amount' => 500000,
            'status' => 'pending',
            'is_installment' => false,
            'parent_invoice_id' => $parentInvoice->id,
            'installment_term_id' => $this->term2->id,
            'installment_number' => 2,
        ]);

        EnrollmentBootcamp::create([
            'invoice_id' => $parentInvoice->id,
            'bootcamp_id' => $this->bootcamp->id,
            'price' => 1000000,
        ]);

        $mockMidtrans = Mockery::mock(MidtransService::class);
        $mockMidtrans->shouldReceive('createTransaction')
            ->once()
            ->andReturn([
                'success' => true,
                'snap_token' => 'mock-snap-token-term-1-fresh',
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-snap-token-term-1-fresh',
            ]);
        $this->app->instance(MidtransService::class, $mockMidtrans);

        $payResponse = $this->actingAs($this->user)->postJson(route('installment.pay-term', $parentInvoice->id));
        $payResponse->assertStatus(200);
        $payResponse->assertJson([
            'success' => true,
            'payment_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-snap-token-term-1-fresh',
            'term_number' => 1,
        ]);
    }
}

