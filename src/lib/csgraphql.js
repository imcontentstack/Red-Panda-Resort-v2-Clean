export const getSEODataByUrl = async (contentType, url, locale) => {
    const graphqlQuery = `
    query MyQuery {
        all_${contentType}(
        locale: "${locale}"
        where: {url: "${url}"}) {
            items {
                seo {
                    canonical_url
                    description
                    title
                    no_follow
                    no_index
                    show_in_site_search
                    show_in_sitemap
                    og_meta_tags {
                    description
                    title
                        imageConnection {
                            edges {
                                node {
                                    url
                                    title
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;

    const graphqlResponse = await fetch(`https://graphql.contentstack.com/stacks/${process.env.CONTENTSTACK_API_KEY}?environment=${process.env.CONTENTSTACK_ENVIRONMENT}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'access_token': process.env.CONTENTSTACK_DELIVERY_TOKEN,
            'branch': process.env.CONTENTSTACK_BRANCH || 'main'
        },
        body: JSON.stringify({ 
            query: graphqlQuery,
            variables: null,
            operationName: "MyQuery"
        }),
    });
    
    if (!graphqlResponse.ok) {
        console.error('GraphQL request failed:', graphqlResponse.status, graphqlResponse.statusText);
        return null;
    }

    const graphqlData = await graphqlResponse.json();
    return graphqlData;
}

export const getSEODataByTypeByTaxonomyLocation= async (contentType, locale, terms) => {
    const termsArray = Array.isArray(terms) ? JSON.stringify(terms) : `["${terms}"]`;
    
    const graphqlQuery = `
    query MyQuery {
        all_${contentType}(
        locale: "${locale}"
        where: {taxonomies: {locations: {term_in: ${termsArray}}}}
        ) {
            total
            items {
                seo {
                    canonical_url
                    description
                    title
                    no_follow
                    no_index
                    show_in_site_search
                    show_in_sitemap
                    og_meta_tags {
                        description
                        title
                        imageConnection {
                            edges {
                                node {
                                    url
                                    title
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;

    const graphqlResponse = await fetch(`https://graphql.contentstack.com/stacks/${process.env.CONTENTSTACK_API_KEY}?environment=${process.env.CONTENTSTACK_ENVIRONMENT}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'access_token': process.env.CONTENTSTACK_DELIVERY_TOKEN,
            'branch': process.env.CONTENTSTACK_BRANCH || 'main'
        },
        body: JSON.stringify({ 
            query: graphqlQuery,
            variables: null,
            operationName: "MyQuery"
        }),
    });
    
    if (!graphqlResponse.ok) {
        console.error('GraphQL request failed:', graphqlResponse.status, graphqlResponse.statusText);
        return null;
    }

    const graphqlData = await graphqlResponse.json();
    return graphqlData;
}
