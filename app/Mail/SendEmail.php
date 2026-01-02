<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Facades\URL;

class SendEmail extends Mailable
{
    use Queueable;

    public $order, $user, $message, $id;

    /**
     * Create a new message instance.
     */
    public function __construct($subject, $message, $user, $id)
    {
        $this->subject = $subject;
        $this->message = $message;
        $this->user = $user;
        $this->id = $id;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'email.send',
            with: [
                'message' => $this->message,
                'customer' => $this->user,
                'order_url' => URL::route('landing.invoice.show', $this->id)
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
