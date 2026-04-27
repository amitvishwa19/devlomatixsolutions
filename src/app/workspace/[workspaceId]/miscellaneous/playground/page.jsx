'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { runNvidiaAction } from './_actions/run-nvidia';
import { Loader2 } from 'lucide-react';

export default function PlaygroundPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const runNvedia = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        const payload = {
            "model": "meta/llama-4-maverick-17b-128e-instruct",
            "messages": [{ "role": "user", "content": "Write a short poem about coding." }],
            "max_tokens": 512,
            "temperature": 1.00,
            "top_p": 1.00,
            "stream": false
        };

        try {
            const res = await runNvidiaAction(payload);
            if (res.success) {
                setResult(res.data);
                console.log("Response:", res.data);
            } else {
                setError(res.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">NVIDIA AI Playground</h1>
            
            <div className="flex gap-2">
                <Button 
                    variant='outline' 
                    onClick={runNvedia} 
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Running..." : "Run Llama 4"}
                </Button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <h3 className="font-semibold mb-2">AI Response:</h3>
                    <div className="whitespace-pre-wrap text-zinc-800">
                        {result.choices?.[0]?.message?.content || JSON.stringify(result, null, 2)}
                    </div>
                </div>
            )}
        </div>
    );
}