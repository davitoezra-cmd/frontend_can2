const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
        ? "https://yukabsen.com/api"
        : "/api")
).replace(/\/+$/, "");


/**
 * =========================================================
 * REQUEST
 * =========================================================
 */
async function request(
    method,
    url,
    body = null,
    requestOptions = {}
) {
    const token = localStorage.getItem("token");

    const headers = {
        Accept:
            requestOptions.responseType === "blob"
                ? "image/png, application/octet-stream, */*"
                : "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    // =====================================================
    // FORM DATA
    // =====================================================

    if (body instanceof FormData) {
        // Jangan set Content-Type secara manual.
        // Browser akan membuat multipart/form-data boundary.
        options.body = body;
    }

    // =====================================================
    // JSON
    // =====================================================

    else if (
        body !== null &&
        body !== undefined
    ) {
        headers["Content-Type"] =
            "application/json";

        options.body = JSON.stringify(body);
    }

    // =====================================================
    // CLEAN URL
    // =====================================================

    const cleanUrl = url.startsWith("/")
        ? url
        : `/${url}`;

    const fullUrl =
        `${API_BASE_URL}${cleanUrl}`;

    let response;

    // =====================================================
    // FETCH
    // =====================================================

    try {
        response = await fetch(
            fullUrl,
            options
        );
    } catch (networkError) {
        console.error(
            "NETWORK ERROR:",
            networkError
        );

        const error = new Error(
            "Network error. Server tidak dapat dihubungi."
        );

        error.status = 0;
        error.data = null;
        error.response = null;

        throw error;
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    let data = null;

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    try {
        // =================================================
        // BLOB RESPONSE
        // =================================================

        if (
            requestOptions.responseType ===
            "blob"
        ) {
            data = await response.blob();
        }

        // =================================================
        // JSON RESPONSE
        // =================================================

        else if (
            contentType.includes(
                "application/json"
            )
        ) {
            data = await response.json();
        }

        // =================================================
        // TEXT RESPONSE
        // =================================================

        else {
            data = await response.text();
        }
    } catch (parseError) {
        console.error(
            "RESPONSE PARSE ERROR:",
            parseError
        );

        data = null;
    }

    // =====================================================
    // DEBUG
    // =====================================================

    console.log("API REQUEST:", {
        method,
        url: fullUrl,
        status: response.status,
        ok: response.ok,
        contentType,
        responseType:
            requestOptions.responseType ||
            "json",
        data,
    });

    // =====================================================
    // ERROR HTTP
    // =====================================================

    if (!response.ok) {
        let message =
            `Request failed: ${response.status}`;

        if (
            data &&
            typeof data === "object" &&
            !(data instanceof Blob)
        ) {
            message =
                data.message ||
                data.error ||
                data.errors?.message ||
                message;
        }

        else if (
            typeof data === "string" &&
            data.trim()
        ) {
            message = data;
        }

        const error =
            new Error(message);

        error.status =
            response.status;

        error.data = data;

        error.response = {
            status: response.status,
            data,
            headers:
                Object.fromEntries(
                    response.headers.entries()
                ),
        };

        // =================================================
        // JANGAN LOGOUT AUTH ENDPOINT
        // =================================================

        const isAuthEndpoint =
            url.endsWith("/login") ||
            url.endsWith("/face-login") ||
            url.includes(
                "/face-login/"
            );

        if (
            response.status === 401 &&
            !isAuthEndpoint
        ) {
            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "/login";
        }

        throw error;
    }

    // =====================================================
    // RETURN
    // =====================================================

    return {
        data,
        status: response.status,
        response,
    };
}


/**
 * =========================================================
 * API FETCH
 * =========================================================
 */
export const apiFetch = {

    get(url, options = {}) {
        return request(
            "GET",
            url,
            null,
            options
        );
    },

    post(
        url,
        body,
        options = {}
    ) {
        return request(
            "POST",
            url,
            body,
            options
        );
    },

    put(
        url,
        body = null,
        options = {}
    ) {
        return request(
            "PUT",
            url,
            body,
            options
        );
    },

    patch(
        url,
        body = null,
        options = {}
    ) {
        return request(
            "PATCH",
            url,
            body,
            options
        );
    },

    delete(
        url,
        options = {}
    ) {
        return request(
            "DELETE",
            url,
            null,
            options
        );
    },
};


export default apiFetch;