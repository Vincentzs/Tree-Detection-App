import {registerUser, loginUser, currUser, initializeParse, logoutUser, editEmail, editUsername} from "../src/routes/login";
import {expect, jest, test} from "@jest/globals";
import Parse from "parse/node";
import {parseArgs} from "util";

/*
Note we should run the tests on the post/get function callbacks 
*/

const mockRequest = {
    method: "POST",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    body: {username: "test", password: "dummy"},
};
const mockUser = {
    username: "test",
    createdAt: "2023-02-17T04:41:30.244Z",
    updatedAt: "2023-02-17T04:41:30.244Z",
    ACL: {"*": {read: true}, G1WhgToMPP: {read: true, write: true}},
    signUp: jest.fn(), // jest mock for signup, does not exist in actual object
    getSessionToken: jest.fn(), // jest mock for getSessionToken, does not exist in actual object
};
const mockResponse: (number, {}) => {} = (returnValue: number, mockUser: {}) => {
    const res = {};
    res.status = jest.fn().mockReturnValue(returnValue);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(mockUser);
    return res;
};

test("registerUser verify user created", async () => {
    // Set up Parse with your back4app server information
    initializeParse();

    const succeedResponse: {} = mockResponse(201, {});
    // Register the user
    await registerUser(mockRequest, succeedResponse);

    // Verify that the user was created
    const query = new Parse.Query(Parse.User);
    query.equalTo("username", "test");
    const result = await query.first();
    expect(result).toBeDefined();
});

test("loginUser with correct credentials", async () => {
    // Set up Parse with your back4app server information
    initializeParse();

    // Attempt to login with correct credentials
    const mockRequest = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: {username: "test", password: "dummy"},
    };

    const succeedResponse: {} = mockResponse(201, {});

    await loginUser(mockRequest, succeedResponse);

    expect(succeedResponse.status).not.toHaveBeenCalledWith(400);
});

test("loginUser with incorrect credentials", async () => {
    // Set up Parse with your back4app server information
    initializeParse();

    // Attempt to login with correct credentials
    const mockRequest = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: {username: "test", password: "wrong password"},
    };

    const failedResponse: {} = mockResponse(400, {});

    await loginUser(mockRequest, failedResponse);

    expect(failedResponse.status).toHaveBeenCalledWith(400);
    expect(failedResponse.send).toHaveBeenCalledWith({
        error: "Login failed: ParseError: 101 Invalid username/password.",
    });
});


//jest.mock("parse/node");

test("registerUser user signup success", async () => {
    Parse.User = jest.fn().mockImplementation(() => {
        return mockUser;
    });
    const statusCode = 201;
    const succeedResponse: {} = mockResponse(statusCode, mockUser);

    await registerUser({}, succeedResponse);

    expect(succeedResponse.status).toHaveBeenCalledWith(statusCode);
    expect(succeedResponse.send).toHaveBeenCalledWith({user: mockUser});
});

test("registerUser user signup failure", async () => {
    const mockError = new Error("Mock Problem");
    Parse.User = jest.fn().mockImplementation(() => {
        throw mockError;
    });
    const statusCode = 400;
    const failedResponse: {} = mockResponse(statusCode, mockError);

    await registerUser({}, failedResponse);

    expect(failedResponse.status).toHaveBeenCalledWith(statusCode);
    expect(failedResponse.send).toHaveBeenCalledWith({
        error: "Failed to create user: " + mockError,
    });
});

test("loginUser user login success", async () => {
    Parse.User.logIn = jest.fn().mockImplementation(() => {
        return mockUser;
    });
    const statusCode = 200;
    const succeedResponse: {} = mockResponse(statusCode, mockUser);

    await loginUser(mockRequest, succeedResponse);

    expect(succeedResponse.status).toReturnWith(statusCode);
    expect(succeedResponse.send).toHaveBeenCalledWith({user: mockUser});
});

test("loginUser user login failure", async () => {
    const mockError = new Error("Mock Problem");
    Parse.User.logIn = jest.fn().mockImplementation(() => {
        throw mockError;
    });

    const statusCode = 400;
    const failedResponse: {} = mockResponse(statusCode, mockError);

    await loginUser(mockRequest, failedResponse);

    expect(failedResponse.status).toHaveBeenCalledWith(statusCode);
    expect(failedResponse.send).toHaveBeenCalledWith({
        error: "Login failed: " + mockError,
    });
});

test("currtUser get current user success", () => {
    Parse.User.current = jest.fn().mockImplementation(() => {
        return mockUser;
    });
    const succeedResponse: {} = mockResponse(201, mockUser);

    currUser(mockRequest, succeedResponse)
    expect(succeedResponse.send).toHaveBeenCalledWith({currUser: mockUser});
});

test("currtUser get current user null", () => {
    Parse.User.current = jest.fn().mockImplementation(() => {
        return null;
    });
    const failedResponse: {} = mockResponse(400, mockUser);

    currUser(mockRequest, failedResponse);

    expect(failedResponse.status).toHaveBeenCalledWith(400);
    expect(failedResponse.send).toHaveBeenCalledWith({error: "No current user"});
});


test("curUser get current user failure", () => {
    const mockError = new Error("Mock Problem");
    Parse.User.current = jest.fn().mockImplementation(() => {
        throw mockError;
    });
    const failedResponse: {} = mockResponse(400, mockError);

    currUser(mockRequest, failedResponse);

    expect(failedResponse.status).toHaveBeenCalledWith(400);
    expect(failedResponse.send).toHaveBeenCalledWith({
        error: "Failed to get current user " + mockError,
    });
});

test('logoutUser destroy session and send success message', async () => {
    // Set up mock Parse server behavior
    const mockSession = {
        destroy: jest.fn()
    };
    const originalQuery = Parse.Query;
    Parse.Query = jest.fn().mockImplementation(() => ({
        equalTo: jest.fn(),
        first: jest.fn().mockResolvedValue(mockSession)
    }));

    const succeedResponse = mockResponse(200, {});
    await logoutUser(mockRequest, succeedResponse);

    expect(mockSession.destroy).toHaveBeenCalled();
    expect(succeedResponse.send).toHaveBeenCalledWith({success: "Logged out successfully"});

    // Restore original Parse server behavior
    Parse.Query = originalQuery;
});

test('logoutUser should send error message if session not found', async () => {
    // Set up mock Parse server behavior
    const originalQuery = Parse.Query;
    Parse.Query = jest.fn().mockImplementation(() => ({
        equalTo: jest.fn(),
        first: jest.fn().mockResolvedValue(null)
    }));

    const failResponse = mockResponse(400, {});
    await logoutUser(mockRequest, failResponse);

    expect(failResponse.status).toHaveBeenCalledWith(400);
    expect(failResponse.send).toHaveBeenCalledWith({error: "Invalid session token"});

    // Restore original Parse server behavior
    Parse.Query = originalQuery;
});

test('logoutUser should send error message if an error occurs', async () => {
    // Set up mock Parse server behavior
    const errorMessage: string = "logout test error";
    const originalQuery = Parse.Query;
    Parse.Query = jest.fn().mockImplementation(() => ({
        equalTo: jest.fn(),
        first: jest.fn().mockRejectedValue(new Error(errorMessage))
    }));

    const failResponse = mockResponse(400, {});
    await logoutUser(mockRequest, failResponse);

    expect(failResponse.status).toHaveBeenCalledWith(400);
    expect(failResponse.send).toHaveBeenCalledWith({error: `Failed to log out: Error: ${errorMessage}`});

    // Restore original Parse server behavior
    Parse.Query = originalQuery;
});


test("editUsername with incorrect credentials", async () => {
    // Set up Parse with your back4app server information
    initializeParse();
    
    // Attempt to login with correct credentials
    const mockRequest = {
      method: "POST",
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
      },
      body: { username: "test", password: "wrong password",newUsername: "newTest" },
    };
    const mockError = new Error("Mock Problem");
    const failedResponse: {} = mockResponse(400, {});

    await editUsername(mockRequest, failedResponse);

    expect(failedResponse.status).toHaveBeenCalledWith(400);
    expect(failedResponse.send).toHaveBeenCalledWith({
        error: "Failed to edit username: " + mockError,
    });
  });

  test("editUsername with correct credentials", async () => {
    // Set up Parse with your back4app server information
    initializeParse();
    
    // Attempt to login with correct credentials
    const mockRequest = {
      username: "sophia", password: "password", newUsername: "newTest" 
    };
    const succeedResponse: {} = mockResponse(201, {});
    await editUsername(mockRequest.body, succeedResponse);
    expect(succeedResponse.status).not.toEqual(400);
  });
  
test("editUsername success", async () => {
    const mockEditRequest = {
        "username": "sophia3",
        "password": "password",
        "newUsername": "newsophia"
      }
    Parse.User.logIn = jest.fn().mockImplementation(() => {
        return mockUser;
    });
    const succeedResponse: {} = mockResponse(201, mockUser);

    await editUsername(mockEditRequest, succeedResponse);

    expect(succeedResponse.status).not.toEqual(400);
});

test("editUsername failure", async () => {
    const mockError = new Error("Mock Problem");
    Parse.User = jest.fn().mockImplementation(() => {
        throw mockError;
    });
    const failedResponse: {} = mockResponse(400, mockError);

    await editUsername({}, failedResponse);

    expect(failedResponse.status).toHaveBeenCalledWith(400);
    expect(failedResponse.send).toHaveBeenCalledWith({
        error: "Failed to edit username: TypeError: Cannot read properties of undefined (reading 'username')",
    });
});




test("editEmail with incorrect credentials", async () => {
    // Set up Parse with your back4app server information
    initializeParse();
    
    // Attempt to login with correct credentials
    const mockRequest = {
        username: "test", password: "wrong password",newEmail: "newemail@email.com"
    };

    const failedResponse: {} = mockResponse(400, {});

    await editEmail(mockRequest, failedResponse);

    expect(failedResponse.status).toHaveBeenCalledWith(400);
  });

  test("editEmail with correct credentials", async () => {
    // Set up Parse with your back4app server information
    initializeParse();
    
    // Attempt to login with correct credentials
    const mockRequest = {
        username: "sophia", password: "password", newEmail: "newTest@email.com" 
      };
    const succeedResponse: {} = mockResponse(201, {});
    await editUsername(mockRequest.body, succeedResponse);
    expect(succeedResponse.status).not.toEqual(400);
  });
  

test("editEmail failure", async () => {
    const mockError = new Error("Mock Problem");
    Parse.User = jest.fn().mockImplementation(() => {
        throw mockError;
    });
    const failedResponse: {} = mockResponse(400, mockError);

    await editEmail({}, failedResponse);

    expect(failedResponse.status).toHaveBeenCalledWith(400);
    expect(failedResponse.send).toHaveBeenCalledWith({
        error: "Failed to edit username: TypeError: Cannot read properties of undefined (reading 'username')",
    });
});
