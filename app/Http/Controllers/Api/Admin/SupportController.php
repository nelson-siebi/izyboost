<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    /**
     * List all tickets.
     */
    public function tickets(Request $request)
    {
        $query = Ticket::with(['user:id,username']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $tickets = $query->latest()->paginate(50);
        return response()->json($tickets);
    }

    /**
     * Get ticket details.
     */
    public function showTicket($uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)
            ->with(['user', 'messages.user', 'assignedTo'])
            ->firstOrFail();

        return response()->json($ticket);
    }

    /**
     * Assign ticket to admin.
     */
    public function assignTicket(Request $request, $uuid)
    {
        $request->validate([
            'admin_id' => 'required|exists:users,id',
        ]);

        $ticket = Ticket::where('uuid', $uuid)->firstOrFail();
        
        $ticket->update([
            'assigned_to' => $request->admin_id,
            'status' => 'in_progress',
        ]);

        return response()->json([
            'message' => 'Ticket assigné',
            'ticket' => $ticket,
        ]);
    }

    /**
     * Reply to ticket (admin).
     */
    public function replyTicket(Request $request, $uuid)
    {
        $request->validate([
            'message' => 'required|string',
            'is_internal' => 'sometimes|boolean',
        ]);

        $ticket = Ticket::where('uuid', $uuid)->firstOrFail();

        $message = $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'is_internal' => $request->is_internal ?? false,
        ]);

        $ticket->update([
            'status' => 'answered',
            'last_reply_at' => now(),
        ]);

        // Send email notification to user
        if (!$request->is_internal) {
            \Illuminate\Support\Facades\Mail::to($ticket->user->email)
                ->send(new \App\Mail\TicketReply($ticket, $request->message));
        }

        return response()->json([
            'message' => 'Réponse envoyée',
            'ticket_message' => $message,
        ]);
    }

    /**
     * Close ticket.
     */
    public function closeTicket($uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)->firstOrFail();

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
            'closed_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Ticket fermé',
        ]);
    }
}
