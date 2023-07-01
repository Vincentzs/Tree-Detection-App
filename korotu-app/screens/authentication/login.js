import { useState } from "react";
import {
  Text,
  View,
  Button,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function LoginPage({ ...props }) {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [showError, setShowError] = useState(false);

  const handleLogin = () => {
    // Attempt to login user with the details provided
    fetch("https://whispering-citadel-32592.herokuapp.com/draft/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data["error"]) {
          // Handle data error
          setShowError(true);
          console.log(data);
        } else {
          // Handle successful login
          // passes user details back up to App.js as an object with attributes
          props.setUser({
            id: data.user.objectId,
            username: data.user.username,
            createdAt: data.user.createdAt,
            sessionId: data.user.sessionToken,
          });
        }
      })
      .catch((error) => {
        // Handle login error
        console.error(error);
        setShowError(true);
      });
  };

  return (
    <KeyboardAvoidingView style={styles.keyboard} behavior="padding">
      <View
        style={[styles.container, { backgroundColor: props.theme.background }]}
      >
        {showError && (
          <View style={styles.alert}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name={"warning"} size={20} color={"white"} />
              <Text
                style={{
                  marginLeft: 20,
                  fontSize: 16,
                  color: "white",
                }}
              >
                Error logging in
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowError(false)}>
              <Ionicons name={"close"} size={40} color={"white"} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/korotu-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.innerContainer}>
          <View style={{ padding: 40, alignItems: "center" }}>
            <TextInput
              onChangeText={setUsername}
              value={username}
              style={[
                styles.textbox,
                { backgroundColor: props.theme.foreground },
              ]}
              placeholder="Enter Username"
            />
            <TextInput
              onChangeText={setPassword}
              value={password}
              style={[
                styles.textbox,
                { backgroundColor: props.theme.foreground },
              ]}
              secureTextEntry={true}
              placeholder="Enter Password"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              style={[
                styles.submitButton,
                { backgroundColor: props.theme.primary },
              ]}
            >
              <Text style={styles.submitButtonText}>Login</Text>
            </TouchableOpacity>
            <View
              style={{
                marginTop: 20,
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Text style={{ fontSize: 16, color: props.theme.text }}>
                Need an account?{" "}
              </Text>
              <TouchableOpacity
                style={{
                  height: 50,
                  alignItems: "center",
                  flexDirection: "row",
                }}
                onPress={() => props.navigation.goBack()}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: props.theme.primary,
                  }}
                >
                  Back to home page
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "25%",
  },
  imageContainer: {
    top: "30%",
    position: "absolute", // necessary for KeyboardAvoidingView
    marginTop: -130,
    width: "100%",
    alignItems: "center",
  },
  logoImage: {
    width: "60%",
  },
  innerContainer: {
    width: "100%",
    top: "30%",
    marginTop: -50,
  },
  textbox: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    paddingLeft: 20,
    marginBottom: 25,
    fontSize: 16,
  },
  alert: {
    top: 50,
    height: 60,
    width: "90%",
    borderRadius: 12,
    position: "absolute",
    backgroundColor: "#DA4343",
    opacity: 0.9,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 10,
    zIndex: 99,
  },
  submitButton: {
    backgroundColor: "white",
    marginTop: 15,
    padding: 12,
    width: "100%",
    borderRadius: 12,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
});
