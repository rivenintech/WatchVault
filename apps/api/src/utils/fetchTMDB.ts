export const fetchTMDB = async (endpoint: string, apiKey: string) => {
    const apiUrl = "https://api.themoviedb.org/3/";
    const url = new URL(endpoint, apiUrl);

    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    };

    try {
        const tmdbResponse = await fetch(url, options);

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
};
