<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\ApiProvider;
use App\Models\ReferralRelationship;
use App\Models\ReferralCommission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ReferralSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed payment methods for orders
        $this->seed(\Database\Seeders\PaymentMethodsSeeder::class);
    }

    /** @test */
    public function it_creates_referral_chain_on_registration()
    {
        $sponsor = User::factory()->create(['sponsor_code' => 'SPONSOR1']);

        $response = $this->postJson('/api/auth/register', [
            'username' => 'newuser',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'sponsor_code' => 'SPONSOR1'
        ]);

        $response->assertStatus(201);

        $newUser = User::where('username', 'newuser')->first();
        $this->assertEquals($sponsor->id, $newUser->sponsor_id);

        $this->assertDatabaseHas('referral_relationships', [
            'sponsor_id' => $sponsor->id,
            'referred_id' => $newUser->id,
            'level' => 1
        ]);
    }

    /** @test */
    public function sponsor_earns_commission_on_referred_user_order()
    {
        $sponsor = User::factory()->create(['balance' => 0, 'earnings' => 0]);
        $referred = User::factory()->create(['sponsor_id' => $sponsor->id, 'balance' => 10000]);

        // Create relationship
        ReferralRelationship::create([
            'sponsor_id' => $sponsor->id,
            'referred_id' => $referred->id,
            'level' => 1,
            'commission_percentage' => 10,
            'status' => 'active'
        ]);

        $apiProvider = ApiProvider::create([
            'name' => 'Test Provider',
            'code' => 'test',
            'base_url' => 'https://api.test.com',
            'api_key' => 'key123',
            'status' => 'active'
        ]);

        $category = \App\Models\Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'type' => 'default',
            'icon' => 'test',
            'is_active' => true
        ]);

        $service = Service::create([
            'api_provider_id' => $apiProvider->id,
            'name' => 'Test Service',
            'slug' => 'test-service',
            'category_id' => $category->id,
            'type' => 'default',
            'external_id' => '101',
            'min_quantity' => 10,
            'max_quantity' => 1000,
            'cost_per_unit' => 0.01,
            'base_price_per_unit' => 0.05,
            'provider' => 'test',
            'is_active' => true
        ]);

        Http::fake([
            'api.test.com*' => Http::response(['order' => 12345], 200)
        ]);

        $this->actingAs($referred)
            ->postJson('/api/user/orders', [
                'service_id' => $service->id,
                'link' => 'https://instagram.com/p/123',
                'quantity' => 100
            ])->assertStatus(201);

        // Order price = 0.05 * 100 = 5 FCFA
        // Commission = 10% of 5 = 0.5 FCFA

        $sponsor->refresh();
        $this->assertEquals(0.5, (float) $sponsor->earnings);

        $this->assertDatabaseHas('referral_commissions', [
            'user_id' => $sponsor->id,
            'from_user_id' => $referred->id,
            'amount' => 0.5
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $sponsor->id,
            'type' => 'success'
        ]);
    }

    /** @test */
    public function sponsor_earns_commission_on_referred_user_deposit()
    {
        $sponsor = User::factory()->create(['balance' => 0, 'earnings' => 0]);
        $referred = User::factory()->create(['sponsor_id' => $sponsor->id]);
        $method = PaymentMethod::where('code', 'orange_money')->first();

        // Create relationship
        ReferralRelationship::create([
            'sponsor_id' => $sponsor->id,
            'referred_id' => $referred->id,
            'level' => 1,
            'commission_percentage' => 10, // 10% on deposits too (per logic in ReferralService)
            'status' => 'active'
        ]);

        $transaction = \App\Models\Transaction::create([
            'user_id' => $referred->id,
            'payment_method_id' => $method->id,
            'type' => 'deposit',
            'amount' => 1000,
            'net_amount' => 1000,
            'status' => 'pending',
            'gateway_transaction_id' => 'REF_TEST_DEP',
            'gateway' => 'nelsius'
        ]);

        Http::fake([
            'api.nelsius.com/*' => Http::response([
                'success' => true,
                'data' => [
                    'status' => 'completed',
                    'is_completed' => true
                ]
            ], 200)
        ]);

        $this->actingAs($referred)
            ->getJson("/api/user/wallet/transactions/REF_TEST_DEP/status")
            ->assertStatus(200);

        $sponsor->refresh();
        // 10% of 1000 = 100 FCFA
        $this->assertEquals(100, (float) $sponsor->earnings);

        $this->assertDatabaseHas('referral_commissions', [
            'user_id' => $sponsor->id,
            'from_user_id' => $referred->id,
            'type' => 'deposit',
            'amount' => 100
        ]);
    }
}
