import React from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";

export function getProbabilityColour(probability) {
  // get dynamic text colour for probability based on % value
  // License: MIT - https://opensource.org/licenses/MIT
  // Author: Michele Locati <michele@locati.it>
  // Source: https://gist.github.com/mlocati/7210513
  var r = 0;
  var g = 0;
  var b = 0;
  if (probability < 50) {
    r = 255;
    g = Math.round(5.1 * probability);
  } else {
    g = 255;
    r = Math.round(510 - 5.1 * probability);
  }
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  var hex = "#" + ("000000" + h.toString(16)).slice(-6);
  return hex;
}

export default function Infobox({ identifiedSpecies, loading }) {
  // infobox for an identified species (used for camera and upload)
  return (
    (identifiedSpecies || loading) && (
      <View style={styles.speciesInfobox}>
        {loading && (
          <View style={{ height: "100%" }}>
            <ActivityIndicator size="large" />
          </View>
        )}
        {identifiedSpecies && (
          <>
            <Text style={styles.h1Text}>
              {identifiedSpecies.plant_details?.scientific_name}
            </Text>
            {identifiedSpecies.plant_details?.common_names ? (
              <>
                <Text style={styles.h2TextLabel}>Nicknames</Text>
                <Text style={styles.h2Text}>
                  {identifiedSpecies.plant_details?.common_names.join(", ")}
                </Text>
              </>
            ) : (
              <Text style={styles.h2TextLabel}>Identified by CustomAPI</Text>
            )}
            {identifiedSpecies.plant_details?.taxonomy && (
              <>
                <Text style={styles.h2TextLabel}>Taxonomy</Text>
                <Text style={styles.h3TextLabel}>
                  Class:{" "}
                  <Text style={styles.h3Text}>
                    {identifiedSpecies.plant_details?.taxonomy?.class}
                  </Text>
                </Text>
                <Text style={styles.h3TextLabel}>
                  Family:{" "}
                  <Text style={styles.h3Text}>
                    {identifiedSpecies.plant_details?.taxonomy?.family}
                  </Text>
                </Text>
                <Text style={styles.h3TextLabel}>
                  Genus:{" "}
                  <Text style={styles.h3Text}>
                    {identifiedSpecies.plant_details?.taxonomy?.genus}
                  </Text>
                </Text>
                <Text style={styles.h3TextLabel}>
                  Kingdom:{" "}
                  <Text style={styles.h3Text}>
                    {identifiedSpecies.plant_details?.taxonomy?.kingdom}
                  </Text>
                </Text>
                <Text style={styles.h3TextLabel}>
                  Order:{" "}
                  <Text style={styles.h3Text}>
                    {identifiedSpecies.plant_details?.taxonomy?.order}
                  </Text>
                </Text>
                <Text style={styles.h3TextLabel}>
                  Phylum:{" "}
                  <Text style={styles.h3Text}>
                    {identifiedSpecies.plant_details?.taxonomy?.phylum}
                  </Text>
                </Text>
              </>
            )}
            {identifiedSpecies?.probability && !loading && (
              <View
                style={[
                  styles.speciesInfoboxProbabilityCircle,
                  {
                    borderWidth: 2,
                    borderColor: getProbabilityColour(
                      (identifiedSpecies?.probability * 100).toFixed(1)
                    ),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.probabilityText,
                    {
                      color: getProbabilityColour(
                        (identifiedSpecies?.probability * 100).toFixed(1)
                      ),
                    },
                  ]}
                >
                  {(identifiedSpecies?.probability * 100).toFixed(1) + "%"}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    )
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: "#4a4a4a",
    width: 60,
    height: 60,
    borderRadius: 35,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 25,
  },
  image: {
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
    justifyContent: "space-between",
    top: 0,
    width: "100%",
    height: undefined,
    aspectRatio: 1,
  },
  speciesInfobox: {
    width: "100%",
    height: "100%",
    padding: 30,
    paddingTop: 20,
    backgroundColor: "#ffffff",
  },
  speciesInfoboxHandle: {
    height: 6,
    width: 40,
    borderRadius: 15,
    backgroundColor: "#A0A0A0",
    position: "absolute",
    top: 8,
    alignSelf: "center",
  },
  speciesInfoboxProbabilityCircle: {
    height: 80,
    width: 80,
    position: "absolute",
    right: 20,
    top: 20,
    borderRadius: "50%",
    borderWidth: 2,
    borderColor: "#C0C0C0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    flex: 1,
  },
  h1Text: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    lineHeight: 30,
    marginBottom: 20,
  },
  h2TextLabel: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: "#A0A0A0",
    lineHeight: 25,
  },
  h2Text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    lineHeight: 25,
  },
  h3TextLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#A0A0A0",
    lineHeight: 25,
    marginLeft: 15,
  },
  h3Text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    lineHeight: 25,
  },
  probabilityText: {
    fontSize: 18,
    fontWeight: "600",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});
