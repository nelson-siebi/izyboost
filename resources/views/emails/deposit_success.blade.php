<x-mail::message>
    # Recharge Confirmée ! 🚀

    Bonjour **{{ $user->username }}**,

    Bonne nouvelle ! Votre dépôt de **{{ number_format($transaction->amount, 0, ',', ' ') }}
    {{ $transaction->currency }}** a été validé avec succès.

    <x-mail::panel>
        ### Détails de la transaction
        - **Montant crédité** : {{ number_format($transaction->net_amount, 0, ',', ' ') }} {{ $transaction->currency }}
        - **Moyen de paiement** : {{ $transaction->paymentMethod->name ?? 'N/A' }}
        - **Date** :
        {{ $transaction->completed_at ? $transaction->completed_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i') }}
        - **Référence** : {{ $transaction->reference }}
    </x-mail::panel>

    Votre nouveau solde est maintenant disponible pour booster vos réseaux sociaux !

    <x-mail::button :url="config('app.url') . '/dashboard'" color="success">
        Voir mon solde
    </x-mail::button>

    Merci de votre confiance,<br>
    **L'équipe IzyBoost**
</x-mail::message>