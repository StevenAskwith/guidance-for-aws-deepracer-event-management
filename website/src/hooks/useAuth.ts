import { Auth } from 'aws-amplify';

/**
 * Authenticated user information returned by the Auth helpers.
 * Centralises all Auth.currentAuthenticatedUser() access patterns
 * to make future Amplify version upgrades a single-file change.
 */
export interface AuthUser {
    /** Cognito username */
    username: string;
    /** Cognito user sub (unique ID, used for S3 paths) */
    sub: string;
    /** Cognito identity pool ID */
    identityId: string;
    /** JWT access token (used for REST API calls) */
    jwtToken: string;
    /** Cognito user groups (e.g. ['admin', 'operator']) */
    groups: string[];
}

/**
 * Get the current authenticated user's information.
 * Combines Auth.currentAuthenticatedUser() and Auth.currentCredentials()
 * into a single typed response.
 */
export const getCurrentAuthUser = async (): Promise<AuthUser> => {
    const user = await Auth.currentAuthenticatedUser();
    const credentials = await Auth.currentCredentials();

    const groups: string[] = user.signInUserSession?.accessToken?.payload?.['cognito:groups'] ?? [];

    return {
        username: user.username,
        sub: user.attributes?.sub ?? '',
        identityId: credentials.identityId ?? '',
        jwtToken: user.signInUserSession?.accessToken?.jwtToken ?? '',
        groups,
    };
};

/**
 * Sign the current user out.
 */
export const authSignOut = async (): Promise<void> => {
    await Auth.signOut();
};

/**
 * Change the current user's password.
 * @param oldPassword - Current password
 * @param newPassword - New password
 */
export const authChangePassword = async (
    oldPassword: string,
    newPassword: string
): Promise<string> => {
    const user = await Auth.currentAuthenticatedUser();
    return Auth.changePassword(user, oldPassword, newPassword);
};
