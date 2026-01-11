<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewWhiteLabelPurchase extends Notification
{
    use Queueable;

    protected $site;
    protected $order;

    /**
     * Create a new notification instance.
     */
    public function __construct($site, $order)
    {
        $this->site = $site;
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle commande White Label ! 🏗️')
            ->greeting('Bonjour Admin,')
            ->line('Une nouvelle demande de site White Label a été soumise.')
            ->line('---')
            ->line('👤 **Client :** ' . $this->site->owner->username)
            ->line('🏢 **Site :** ' . $this->site->site_name)
            ->line('💎 **Plan :** ' . ($this->site->plan->name ?? 'N/A'))
            ->line('⏳ **Statut :** En attente de validation')
            ->line('---')
            ->action('Gérer les demandes', url('/admin/saas'))
            ->line('Veuillez activer et configurer ce site dès que possible.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
