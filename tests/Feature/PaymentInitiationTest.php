<?php

namespace Tests\Feature;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentInitiationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed payment methods
        $this->seed(\Database\Seeders\PaymentMethodsSeeder::class);
    }

    /** @test */
    public function it_can_initiate_mobile_money_payment()
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $method = PaymentMethod::where('code', 'orange_money')->first();

        Http::fake([
            'api.nelsius.com/api/v1/payments/mobile-money' => Http::response([
                'success' => true,
                'message' => 'Paiement initié avec succès.',
                'data' => [
                    'reference' => 'TXN_TEST_123',
                    'status' => 'pending'
                ]
            ], 200)
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/user/wallet/deposit', [
                'payment_method_id' => $method->id,
                'amount' => 500,
                'phone' => '699000000'
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('reference', 'TXN_TEST_123');

        Http::assertSent(function ($request) {
            return $request['operator'] === 'orange_money' &&
                $request['phone'] === '699000000' &&
                $request['amount'] == 500;
        });
    }

    /** @test */
    public function it_can_initiate_global_payment_with_redirect()
    {
        $user = User::factory()->create(['email' => 'client@example.com']);
        $method = PaymentMethod::where('code', 'global_unified')->first();

        Http::fake([
            'api.nelsius.com/api/v1/payments/mobile-money' => Http::response([
                'success' => true,
                'data' => [
                    'is_redirect' => true,
                    'payment_url' => 'https://leekpay.fr/checkout/test_url',
                    'transaction' => [
                        'reference' => 'PAY_TEST_456',
                        'status' => 'pending'
                    ]
                ]
            ], 200)
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/user/wallet/deposit', [
                'payment_method_id' => $method->id,
                'amount' => 5000
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('payment_url', 'https://leekpay.fr/checkout/test_url');

        Http::assertSent(function ($request) {
            return $request['operator'] === 'global' &&
                $request['email'] === 'client@example.com';
        });
    }

    /** @test */
    public function it_updates_balance_when_transaction_is_completed()
    {
        $user = User::factory()->create(['balance' => 0]);
        $method = PaymentMethod::where('code', 'orange_money')->first();

        $transaction = \App\Models\Transaction::create([
            'user_id' => $user->id,
            'payment_method_id' => $method->id,
            'type' => 'deposit',
            'amount' => 1000,
            'net_amount' => 1000,
            'status' => 'pending',
            'gateway_transaction_id' => 'REF_ABC_789',
            'gateway' => 'nelsius'
        ]);

        Http::fake([
            'api.nelsius.com/api/v1/payments/mobile-money/REF_ABC_789' => Http::response([
                'success' => true,
                'data' => [
                    'status' => 'completed',
                    'is_completed' => true
                ]
            ], 200)
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/user/wallet/transactions/REF_ABC_789/status");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'completed');

        $user->refresh();
        $this->assertEquals(1000, (float) $user->balance);

        $transaction->refresh();
        $this->assertEquals('completed', $transaction->status);

        // Verify notification
        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type' => 'success',
        ]);
    }
}
