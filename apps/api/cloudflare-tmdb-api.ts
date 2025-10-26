export interface Env {
    TMDB_API_KEY: string;
}

export default {
    async fetch(request: Request, env: Env) {
        const url = new URL(request.url);
        const endpoint = url.pathname + url.search;
        const tmdbUrl = new URL(`https://api.themoviedb.org/3/${endpoint}`);

        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${env.TMDB_API_KEY}`,
            },
        };

        try {
            const tmdbResponse = await fetch(tmdbUrl, options);

            // Return response to client
            return new Response(tmdbResponse.body, {
                status: tmdbResponse.status,
                headers: tmdbResponse.headers,
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: "Failed to fetch from TMDB", details: error }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    },
};
