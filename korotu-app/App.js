import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import CameraScreen from "./screens/home/camera";
import LibraryScreen from "./screens/home/library";
import UploadScreen from "./screens/home/upload";
import SettingsScreen from "./screens/home/settings";
import LandingPage from "./screens/authentication/landing";
import LoginPage from "./screens/authentication/login";
import SignupPage from "./screens/authentication/signup";

export default function App() {
  // main controller for the entire app; provides navigation to different screens
  const [user, setUser] = useState(null);
  // user defaults to null (not logged in) and is set to a user object when logged in,
  // which gets passed as a prop to other pages to reference (ex: settings)
  const [theme, setTheme] = useState({
    background: "#ffffff",
    foreground: "#E5E5E5",
    text: "#000000",
    primary: "#367961",
  }); // colour theme passed throughout the app for clean data architecture

  function HomeNavigator({ ...props }) {
    // Home navigator for the menu tab view once a user is logged in
    return (
      <Tab.Navigator
        initialRouteName="Library"
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Camera") {
              iconName = focused ? "camera" : "camera-outline";
            } else if (route.name === "Upload") {
              iconName = focused ? "image" : "image-outline";
            } else if (route.name === "Library") {
              iconName = focused ? "leaf" : "leaf-outline";
            } else if (route.name === "Settings") {
              iconName = focused ? "cog" : "cog-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Camera">
          {(prop) => (
            <CameraScreen {...prop} user={props.user} theme={props.theme} />
          )}
        </Tab.Screen>
        <Tab.Screen name="Upload">
          {(prop) => (
            <UploadScreen {...prop} user={props.user} theme={props.theme} />
          )}
        </Tab.Screen>
        <Tab.Screen name="Library" options={{ unmountOnBlur: true }}>
          {(prop) => (
            <LibraryScreen {...prop} user={props.user} theme={props.theme} />
          )}
        </Tab.Screen>
        <Tab.Screen name="Settings">
          {(prop) => (
            <SettingsScreen
              {...prop}
              user={props.user}
              setUser={props.setUser} // settings needs this function passed to logout user
              theme={props.theme}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LandingPage"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        {!user ? (
          // when user is not logged in, show landing, login and sign up screens
          <>
            {/* Landing page where user can select "Login" or "Sign up" */}
            <Stack.Screen
              name="LandingPage"
              options={{
                animationTypeForReplace: user ? "push" : "pop",
              }}
            >
              {(props) => <LandingPage {...props} theme={theme} />}
            </Stack.Screen>
            {/* Login page accessed by Landing Page */}
            <Stack.Screen name="Login">
              {(props) => (
                <LoginPage {...props} setUser={setUser} theme={theme} />
              )}
            </Stack.Screen>
            {/* Sign up page accessed by Landing Page */}
            <Stack.Screen name="Signup">
              {(props) => (
                <SignupPage {...props} setUser={setUser} theme={theme} />
              )}
            </Stack.Screen>
          </>
        ) : (
          // when user is logged in, show home navigation with tab menu screens
          <>
            {/* Main app screen with a 4-page menu bar (once logged in) */}
            <Stack.Screen name="Home">
              {(props) => (
                <HomeNavigator
                  {...props}
                  user={user}
                  setUser={setUser}
                  theme={theme}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();
