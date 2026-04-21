/**
 * Fetches redirect rules from Contentstack
 * Returns an array of redirect objects with from and to paths
 * @param {Object} options
 * @param {boolean} options.edge - When true, omits Next.js fetch options (for Edge runtime/middleware)
 */
export async function getRedirects(options = {}) {
  const graphqlQuery = `
    query GetRedirects {
      all_redirects {
        items {
          paths {
            from
            to
          }
        }
      }
    }
  `;

  try {
    const graphqlResponse = await fetch(
      `https://graphql.contentstack.com/stacks/${process.env.CONTENTSTACK_API_KEY}?environment=${process.env.CONTENTSTACK_ENVIRONMENT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          access_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
          branch: process.env.CONTENTSTACK_BRANCH || "main",
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: null,
          operationName: "GetRedirects",
        }),
        ...(!options.edge && { next: { revalidate: 60 } }),
      }
    );

    if (!graphqlResponse.ok) {
      console.error(
        "GraphQL request failed:",
        graphqlResponse.status,
        graphqlResponse.statusText
      );
      return [];
    }

    const graphqlData = await graphqlResponse.json();

    if (graphqlData.errors) {
      console.error("GraphQL errors:", graphqlData.errors);
      return [];
    }

    // Flatten the array of paths from all redirect entries
    const redirectEntries = graphqlData?.data?.all_redirects?.items || [];
    const allRedirects = [];
    
    for (const entry of redirectEntries) {
      if (entry.paths && Array.isArray(entry.paths)) {
        allRedirects.push(...entry.paths);
      }
    }

    return allRedirects;
  } catch (error) {
    console.error("Error fetching redirects:", error);
    return [];
  }
}

