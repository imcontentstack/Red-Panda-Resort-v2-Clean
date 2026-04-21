import Personalize from '@contentstack/personalize-edge-sdk';

/** Cookie name for live attributes (JSON object: { "a": "b", "c": "d" }) */
export const PERSONALIZE_LIVE_ATTRS_COOKIE = 'cs_personalize_live_attrs';

/**
 * Set live attributes in cookie (client-side). Merges with existing.
 * @param {Record<string, string>} attributes - e.g. { "client_type": "abc", "other": "value" }
 * Use empty string to clear an attribute. Reload/navigate for next request to pick it up.
 */
export function setPersonalizeLiveAttributesCookie(attributes) {
    if (typeof document === 'undefined' || !attributes || typeof attributes !== 'object') return;
    const current = getLiveAttributesFromDocument();
    const merged = { ...current, ...attributes };
    // Remove keys with null/undefined
    Object.keys(merged).forEach((k) => {
        if (merged[k] == null) delete merged[k];
    });
    document.cookie = `${PERSONALIZE_LIVE_ATTRS_COOKIE}=${encodeURIComponent(JSON.stringify(merged))}; path=/; max-age=31536000; SameSite=Lax`;
}

function getLiveAttributesFromDocument() {
    if (typeof document === 'undefined') return {};
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${PERSONALIZE_LIVE_ATTRS_COOKIE}=`);
    if (parts.length !== 2) return {};
    try {
        const parsed = JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

function getLiveAttributesFromRequest(request) {
    let raw = null;
    if (request.cookies?.get) {
        raw = request.cookies.get(PERSONALIZE_LIVE_ATTRS_COOKIE)?.value;
    } else {
        const cookieHeader = request.headers?.get?.('Cookie');
        if (cookieHeader) {
            const match = cookieHeader.match(new RegExp(`(?:^|; )${PERSONALIZE_LIVE_ATTRS_COOKIE}=([^;]*)`));
            raw = match ? match[1] : null;
        }
    }
    if (!raw) return {};
    try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

export const initializePersonalize = async (request, CONTENTSTACK_PERSONALIZE_EDGE_API_URL, CONTENTSTACK_PERSONALIZE_PROJECT_UID) => {
    try {
        // Check if personalization is properly configured
        if (!CONTENTSTACK_PERSONALIZE_PROJECT_UID || 
            CONTENTSTACK_PERSONALIZE_PROJECT_UID === 'null' || 
            CONTENTSTACK_PERSONALIZE_PROJECT_UID === 'undefined' ||
            CONTENTSTACK_PERSONALIZE_PROJECT_UID.trim() === '') {
            console.warn('CONTENTSTACK_PERSONALIZATION is not properly configured. Personalization features will be disabled.');
            return { variantParam: null, personalize: null, error: null };
        }

        if (CONTENTSTACK_PERSONALIZE_EDGE_API_URL) {
            const url = CONTENTSTACK_PERSONALIZE_EDGE_API_URL.includes('https://') 
                ? CONTENTSTACK_PERSONALIZE_EDGE_API_URL 
                : `https://${CONTENTSTACK_PERSONALIZE_EDGE_API_URL}`;
            Personalize.setEdgeApiUrl(url);
        }

        const liveAttributes = getLiveAttributesFromRequest(request);

        const personalize = await Personalize.init(CONTENTSTACK_PERSONALIZE_PROJECT_UID, {
            request,
            ...(Object.keys(liveAttributes).length > 0 && { liveAttributes }),
        });

        const variantParam = personalize.getVariantParam();

        return { variantParam, personalize };
    } catch (error) {
        return { variantParam: null, personalize: null, error: error };
    }
};