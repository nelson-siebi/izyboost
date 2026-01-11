<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WhiteLabelSiteReady extends Notification
{
    use Queueable;

    protected $site;
    protected $siteUrl;
    protected $adminUrl;
    protected $adminUser;
    protected $adminPass;

    /**
     * Create a new notification instance.
     */
    public function __construct($site, $siteUrl, $adminUrl, $adminUser, $adminPass)
    {
        $this->site = $site;
        $this->siteUrl = $siteUrl;
        $this->adminUrl = $adminUrl;
        $this->adminUser = $adminUser;
        $this->adminPass = $adminPass;
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
            ->subject('Votre site est prêt ! 🚀')
            ->greeting('Bonjour ' . $notifiable->username . ',')
            ->line('Bonne nouvelle ! Votre site **' . $this->site->site_name . '** a été validé et est maintenant en ligne.')
            ->line('Voici vos informations pour commencer :')
            ->line('🌐 **URL du site :** ' . $this->siteUrl)
            ->action('Voir mon site', $this->siteUrl)
            ->line('---')
            ->line('**Accès Administration :**')
            ->line('🔗 URL Admin : ' . $this->siteUrl . $this->adminUrl)
            ->line('👤 Identifiant : ' . $this->adminUser)
            ->line('🔑 Mot de passe : ' . $this->adminPass)
            ->line('---')
            ->line('Nous vous conseillons de changer ce mot de passe dès votre première connexion.')
            ->line('Merci de votre confiance !');
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
