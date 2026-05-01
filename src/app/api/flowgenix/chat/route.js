import { runAgent } from "../../../workspace/[workspaceId]/flowgenix/_lib/agent-runtime";

export async function POST(req) {
    try {
        const { config, history, userInput, ragDocs } = await req.json();

        const encoder = new TextEncoder();
        const stream = new TransformStream();
        const writer = stream.writable.getWriter();

        // Run agent in background and pipe to stream
        (async () => {
            try {
                await runAgent(
                    config,
                    history,
                    userInput,
                    ragDocs,
                    (update) => {
                        writer.write(encoder.encode(JSON.stringify(update) + "\n"));
                    },
                    null
                );
            } catch (e) {
                writer.write(encoder.encode(JSON.stringify({ error: e.message }) + "\n"));
            } finally {
                writer.close();
            }
        })();

        return new Response(stream.readable, {
            headers: {
                "Content-Type": "application/x-ndjson",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
