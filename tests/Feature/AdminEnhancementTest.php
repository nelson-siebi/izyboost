<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;
use App\Models\User;
use App\Models\Service;
use App\Models\Order;
use App\Models\ApiProvider;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use App\Models\Category;

class AdminEnhancementTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $admin;
    protected $service;
    protected $provider;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'balance' => 5000,
            'role' => 'user'
        ]);

        $this->admin = User::factory()->create([
            'role' => 'admin'
        ]);

        $this->provider = ApiProvider::create([
            'name' => 'BoostCI',
            'code' => 'boostci',
            'base_url' => 'https://boostci.pro/api/v2',
            'api_key' => 'test-key',
            'status' => 'active'
        ]);

        $this->category = Category::create([
            'name' => 'Social Media',
            'slug' => 'social-media',
            'is_active' => true
        ]);

        $this->service = Service::create([
            'name' => 'Instagram Likes',
            'type' => 'default',
            'category_id' => $this->category->id,
            'api_provider_id' => $this->provider->id,
            'external_id' => '101',
            'provider' => 'BoostCI',
            'min_quantity' => 10,
            'max_quantity' => 1000,
            'cost_per_unit' => 0.01,
            'base_price_per_unit' => 0.05,
            'is_active' => true
        ]);

        PaymentMethod::create([
            'code' => 'wallet',
            'name' => 'Wallet',
            'type' => 'ewallet',
            'is_active' => true,
            'currencies' => ['XAF', 'EUR', 'USD'],
            'config' => []
        ]);
    }

    /** @test */
    public function it_debits_balance_only_after_successful_api_order()
    {
        Http::fake([
            'https://boostci.pro/api/v2' => Http::response(['order' => 12345], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/user/orders', [
                'service_id' => $this->service->id,
                'link' => 'https://instagram.com/p/123',
                'quantity' => 100
            ]);

        $response->assertStatus(201);
        $this->user->refresh();

        // sellPrice for 100 is 100 * 0.05 = 5
        $this->assertEquals(4995, $this->user->balance);
        $this->assertDatabaseHas('orders', [
            'status' => 'in_progress',
            'external_order_id' => '12345'
        ]);
    }

    /** @test */
    public function it_does_not_debit_balance_on_provider_insufficient_funds()
    {
        Http::fake([
            'https://boostci.pro/api/v2' => Http::response(['error' => 'neworder.error.not_enough_funds'], 200)
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/user/orders', [
                'service_id' => $this->service->id,
                'link' => 'https://instagram.com/p/123',
                'quantity' => 100
            ]);

        $response->assertStatus(202);
        $this->user->refresh();

        // Balance remains 5000
        $this->assertEquals(5000, $this->user->balance);
        $this->assertDatabaseHas('orders', [
            'status' => 'processing',
            'api_error' => 'provider_low_balance'
        ]);
    }

    /** @test */
    public function it_credits_user_on_transaction_approval()
    {
        $pm = PaymentMethod::create([
            'code' => 'momo',
            'name' => 'MoMo',
            'type' => 'mobile_money',
            'is_active' => true,
            'currencies' => ['XAF'],
            'config' => []
        ]);

        $tx = Transaction::create([
            'user_id' => $this->user->id,
            'payment_method_id' => $pm->id,
            'type' => 'deposit',
            'amount' => 1000,
            'net_amount' => 1000,
            'status' => 'pending',
            'currency' => 'XAF'
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/finance/transactions/{$tx->id}/verify");

        $response->assertStatus(200);
        $this->user->refresh();
        $this->assertEquals(6000, $this->user->balance);
        $this->assertEquals('completed', $tx->fresh()->status);
    }

    /** @test */
    public function it_fails_transaction_on_rejection_and_does_not_credit_user()
    {
        $pm = PaymentMethod::create([
            'code' => 'momo',
            'name' => 'MoMo',
            'type' => 'mobile_money',
            'is_active' => true,
            'currencies' => ['XAF'],
            'config' => []
        ]);

        $tx = Transaction::create([
            'user_id' => $this->user->id,
            'payment_method_id' => $pm->id,
            'type' => 'deposit',
            'amount' => 1000,
            'net_amount' => 1000,
            'status' => 'pending',
            'currency' => 'XAF'
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/finance/transactions/{$tx->id}/reject", ['reason' => 'Proof invalid']);

        $response->assertStatus(200);
        $this->user->refresh();
        $this->assertEquals(5000, $this->user->balance);
        $this->assertEquals('failed', $tx->fresh()->status);
        $this->assertEquals('Proof invalid', $tx->fresh()->admin_notes);
    }
}
