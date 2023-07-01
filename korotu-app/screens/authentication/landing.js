import React from "react";
import {
  Text,
  View,
  Button,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

export default function LandingPage({ ...props }) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/tree-backdrop.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.innerContainer}>
          <Image
            source={require("../../assets/korotu-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.innerSectionContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => props.navigation.navigate("Login")}
              style={[styles.button, { backgroundColor: props.theme.primary }]}
            >
              <Text style={[styles.buttonText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => props.navigation.navigate("Signup")}
              style={styles.button}
            >
              <Text style={[styles.buttonText, { color: props.theme.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  logoImage: {
    width: "60%",
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "25%",
  },
  innerSectionContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  button: {
    backgroundColor: "white",
    marginTop: 30,
    padding: 14,
    width: "70%",
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
});
