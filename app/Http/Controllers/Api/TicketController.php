<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\Notification;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * List user's tickets.
     */
    public function index(Request $request)
    {
        $tickets = $request->user()->tickets()
            ->with(['messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->latest()
            ->paginate(20);

        return response()->json($tickets);
    }

    /**
     * Create a new ticket.
     */
    public function store(Request $request)
    {
        $request->validate([
            'department' => 'required|in:support,billing,technical,sales,abuse',
            'priority' => 'required|in:low,medium,high,urgent',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $ticket = $request->user()->tickets()->create([
            'department' => $request->department,
            'priority' => $request->priority,
            'status' => 'open',
            'subject' => $request->subject,
        ]);

        // Create first message
        $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'is_internal' => false,
        ]);

        // Create notification for admins (simplified - in production, notify actual admins)
        // This is just a placeholder for the notification system

        return response()->json([
            'message' => 'Ticket créé avec succès',
            'ticket' => $ticket->load('messages'),
        ], 201);
    }

    /**
     * Get ticket details with messages.
     */
    public function show(Request $request, $uuid)
    {
        $ticket = $request->user()->tickets()
            ->where('uuid', $uuid)
            ->with(['messages.user', 'assignedTo'])
            ->firstOrFail();

        // Mark messages as read
        $ticket->messages()
            ->whereNull('read_at')
            ->where('user_id', '!=', $request->user()->id)
            ->update(['read_at' => now()]);

        return response()->json($ticket);
    }

    /**
     * Reply to a ticket.
     */
    public function reply(Request $request, $uuid)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $ticket = $request->user()->tickets()
            ->where('uuid', $uuid)
            ->firstOrFail();

        if ($ticket->status === 'closed') {
            return response()->json([
                'error' => 'Ce ticket est fermé'
            ], 422);
        }

        $message = $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'is_internal' => false,
        ]);

        // Update ticket status and last_reply_at
        $ticket->update([
            'status' => 'pending',
            'last_reply_at' => now(),
        ]);

        return response()->json([
            'message' => 'Réponse envoyée',
            'ticket_message' => $message,
        ], 201);
    }

    /**
     * Close a ticket.
     */
    public function close(Request $request, $uuid)
    {
        $ticket = $request->user()->tickets()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
            'closed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Ticket fermé',
        ]);
    }
}
