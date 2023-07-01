import Parse from 'parse';

export async function getParseUser(sessionToken: string | string[]): Promise<Parse.User> {
    const query = new Parse.Query(Parse.Session);
    console.log(sessionToken);
    query.equalTo("sessionToken", sessionToken);
    query.include("user");
    query.include("sessionToken");
    const session = await query.first({useMasterKey: true});
    if (session) {
        return session.get("user");
    } else {
        throw new Error("Invalid session token");
    }
}