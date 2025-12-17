<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketReply extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $message;

    public function __construct(Ticket $ticket, $message)
    {
        $this->ticket = $ticket;
        $this->message = $message;
    }

    public function build()
    {
        return $this->subject("Réponse à votre ticket #{$this->ticket->id}")
                    ->view('emails.ticket-reply');
    }
}
