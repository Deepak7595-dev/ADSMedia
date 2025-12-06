<?php

namespace App\Http\Controllers;

use App\Services\ADSMediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Laravel Controller for ADSMedia
 */
class ADSMediaController extends Controller
{
    private ADSMediaService $adsmedia;

    public function __construct(ADSMediaService $adsmedia)
    {
        $this->adsmedia = $adsmedia;
    }

    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string',
            'html' => 'required|string',
            'to_name' => 'nullable|string',
            'from_name' => 'nullable|string',
            'text' => 'nullable|string',
        ]);

        try {
            $result = $this->adsmedia->send(
                $request->input('to'),
                $request->input('subject'),
                $request->input('html'),
                $request->input('to_name'),
                $request->input('from_name'),
                $request->input('text')
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function sendBatch(Request $request): JsonResponse
    {
        $request->validate([
            'recipients' => 'required|array',
            'recipients.*.email' => 'required|email',
            'subject' => 'required|string',
            'html' => 'required|string',
        ]);

        try {
            $result = $this->adsmedia->sendBatch(
                $request->input('recipients'),
                $request->input('subject'),
                $request->input('html'),
                $request->input('text'),
                $request->input('preheader'),
                $request->input('from_name')
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function checkSuppression(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        try {
            $result = $this->adsmedia->checkSuppression($request->query('email'));
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function ping(): JsonResponse
    {
        try {
            $result = $this->adsmedia->ping();
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

