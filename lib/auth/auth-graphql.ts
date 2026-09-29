/**
 * GraphQL auth client
 * Uses the site's existing WPGraphQL + WooGraphQL endpoint.
 * Requires WPGraphQL JWT Authentication plugin for the login mutation.
 * Server-side only.
 */

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://cms.thehookahstore.in/graphql';

async function gql(query: string, variables: object = {}, authToken?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });
    const json = await res.json() as { data?: unknown; errors?: { message: string }[] };
    if (json.errors?.length) throw new Error(json.errors[0].message);
    return json.data;
}

/* ─────────────────────────────────────────────────────────
   Register a new WooCommerce customer
   (WooGraphQL — registerCustomer mutation)
───────────────────────────────────────────────────────── */
export interface RegisteredCustomer {
    id: string;
    databaseId: number;
    email: string;
    firstName: string;
    lastName: string;
}

export async function graphqlRegisterCustomer({
    username,
    email,
    password,
    firstName,
    lastName,
}: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}): Promise<RegisteredCustomer> {
    const MUTATION = `
        mutation RegisterCustomer($input: RegisterCustomerInput!) {
            registerCustomer(input: $input) {
                customer {
                    id
                    databaseId
                    email
                    firstName
                    lastName
                }
            }
        }
    `;
    const data = await gql(MUTATION, {
        input: { username, email, password, firstName, lastName },
    }) as { registerCustomer: { customer: RegisteredCustomer } };
    return data.registerCustomer.customer;
}

/* ─────────────────────────────────────────────────────────
   Authenticate a user — returns a WP auth token + user info.
   Requires: WPGraphQL JWT Authentication plugin on WordPress.
   Plugin URL: https://github.com/wp-graphql/wp-graphql-jwt-authentication
───────────────────────────────────────────────────────── */
export interface LoginResult {
    authToken: string;
    user: {
        id: string;
        databaseId: number;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export async function graphqlLogin(username: string, password: string): Promise<LoginResult> {
    const MUTATION = `
        mutation Login($username: String!, $password: String!) {
            login(input: {
                clientMutationId: "auth"
                username: $username
                password: $password
            }) {
                authToken
                user {
                    id
                    databaseId
                    email
                    firstName
                    lastName
                }
            }
        }
    `;
    const data = await gql(MUTATION, { username, password }) as { login: LoginResult };
    return data.login;
}

/* ─────────────────────────────────────────────────────────
   Check if a customer with this email already exists.
   Uses a viewer query after login OR falls back to a
   simple registration attempt and reading the WP error.
───────────────────────────────────────────────────────── */
export async function graphqlCheckEmailExists(email: string): Promise<boolean> {
    // WPGraphQL doesn't allow unauthenticated customer lookup.
    // We attempt a dummy register and check if WP says email is taken.
    try {
        const QUERY = `
            query CheckUser($email: String!) {
                users(where: { search: $email }) {
                    nodes { email }
                }
            }
        `;
        const data = await gql(QUERY, { email }) as {
            users: { nodes: { email: string }[] };
        };
        return data.users.nodes.some(u => u.email.toLowerCase() === email.toLowerCase());
    } catch {
        return false; // Can't determine — let registration attempt reveal it
    }
}
