'use client';

export default function Error({ error, reset }) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p>{error.message}</p>
            <button onClick={reset} className="mt-4 btn-primary">
                Try again
            </button>
        </div>
    );
}
